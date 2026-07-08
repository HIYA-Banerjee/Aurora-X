import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpStatus,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthMetricsService } from '../services/auth-metrics.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { PublicRoute } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { UserRecord } from '@aurora-x/shared-types';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly metrics: AuthMetricsService,
    private readonly configService: ConfigService,
  ) {}

  @PublicRoute()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Validation or validation errors' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const requestId = req['id'] || 'N/A';
    return this.authService.register(dto, requestId);
  }

  @PublicRoute()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated, cookies set',
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  @ApiResponse({ status: 403, description: 'Account temporarily locked' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const requestId = req['id'] || 'N/A';
    const tokens = await this.authService.login(dto, requestId);

    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    // Cookie expires after 7 days
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: tokens.accessToken,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate session' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  async logout(
    @CurrentUser() user: UserRecord,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const requestId = req['id'] || 'N/A';
    await this.authService.logout(user.id, requestId);

    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
    });

    return { message: 'Logged out successfully' };
  }

  @PublicRoute()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate access and refresh tokens' })
  @ApiResponse({ status: 200, description: 'Tokens rotated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or missing refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const requestId = req['id'] || 'N/A';
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const tokens = await this.authService.refresh(refreshToken, requestId);

    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: tokens.accessToken,
    };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns user record' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async me(@CurrentUser() user: UserRecord) {
    return user;
  }

  @PublicRoute()
  @Get('health/auth')
  @ApiOperation({ summary: 'Auth module health status' })
  @ApiResponse({ status: 200, description: 'Auth module healthy' })
  async health() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      telemetry: this.metrics.getMetrics(),
    };
  }
}

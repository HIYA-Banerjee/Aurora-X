import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationQueryDto } from './dto/recommendation-query.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserRecord } from '@aurora-x/shared-types';
import { API_PREFIX } from '../../common/constants';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Recommendations')
@ApiBearerAuth()
@Controller(`${API_PREFIX}/recommendations`)
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve recommendations list' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of recommendations.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          items: [
            {
              id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
              userId: 'user-uuid-1234-5678',
              type: 'MemoryRecommendation',
              explanation:
                'Based on your recent tags, we recommend checking out related summer photos.',
              confidenceScore: 0.95,
              generatedAt: '2026-07-08T12:00:00.000Z',
            },
          ],
          nextCursor: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        },
        timestamp: '2026-07-08T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findAll(
    @Query() query: RecommendationQueryDto,
    @CurrentUser() user: UserRecord,
  ) {
    return this.recommendationService.findMany(user.id, query, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a recommendation' })
  @ApiParam({ name: 'id', description: 'Recommendation UUID' })
  @ApiResponse({
    status: 200,
    description: 'Recommendation retrieved successfully.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
          userId: 'user-uuid-1234-5678',
          type: 'MemoryRecommendation',
          explanation:
            'Based on your recent tags, we recommend checking out related summer photos.',
          confidenceScore: 0.95,
          generatedAt: '2026-07-08T12:00:00.000Z',
        },
        timestamp: '2026-07-08T12:00:05.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Owner mismatch.' })
  @ApiResponse({ status: 404, description: 'Recommendation not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: UserRecord,
  ) {
    return this.recommendationService.findOne(user.id, id, user.role);
  }
}

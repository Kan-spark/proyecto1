import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @CurrentUser() user: any,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(
      user.id,
      createReviewDto,
    );
  }

  @Get('producer/:id')
  findByProducer(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.reviewsService.findByProducer(id);
  }
}
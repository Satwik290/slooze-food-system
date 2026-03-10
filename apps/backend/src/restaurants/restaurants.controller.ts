import { Controller, Get, Param } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  findAll(
    @CurrentUser()
    user: {
      id: string;
      email: string;
      role: string;
      regionId: string;
    },
  ) {
    return this.restaurantsService.findAll(user.regionId, user.role);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser()
    user: { userId: string; email: string; role: string; regionId: string },
  ) {
    return this.restaurantsService.findOne(id, user.regionId, user.role);
  }

  @Get(':id/menu')
  getMenu(
    @Param('id') id: string,
    @CurrentUser()
    user: { userId: string; email: string; role: string; regionId: string },
  ) {
    return this.restaurantsService.getMenu(id, user.regionId, user.role);
  }
}

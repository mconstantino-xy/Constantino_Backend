import { Controller } from '@nestjs/common';

// import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
// import { UsersService } from './users.service';
// import { AuthGuard } from '@nestjs/passport';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: any) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAll() {
    return this.categoryService.getAll();
  } 

//   @UseGuards(AuthGuard('jwt'))
//   @Get(':id')
//   async getOne(@Param('id') id: string) {
//     return this.categoryService.findById(+id);
//   }

//   @Post()
//   async create(
//     @Body() body: { username: string; password: string },
//   ) {
//     return this.usersService.createUser(
//       body.username,
//       body.password,
//     );
//   }

//   @UseGuards(AuthGuard('jwt'))
//   @Put(':id')
//   async update(
//     @Param('id') id: string,
//     @Body() body: any,
//   ) {
//     return this.usersService.updateUser(+id, body);
//   }

//   @UseGuards(AuthGuard('jwt'))
//   @Delete(':id')
//   async remove(@Param('id') id: string) {
//     return this.usersService.deleteUser(+id);
//   }
}
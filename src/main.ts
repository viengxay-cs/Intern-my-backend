import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common'; // Import ໂຕນີ້ເພີ່ມ
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. ເປີດໃຊ້ງານ ValidationPipe ເພື່ອໃຫ້ class-validator ເຮັດວຽກ
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // ກັ່ນກອງ Field ທີ່ບໍ່ມີໃນ DTO ອອກອັດໂນມັດ
      forbidNonWhitelisted: true, // ແຈ້ງ Error ທັນທີຖ້າມີ Field ແປກປອມສົ່ງມາ
      transform: true,            // ແປງ Type ຂອງຂໍ້ມູນຕາມ DTO ອັດໂນມັດ
    }),
  );

  // 2. ເປີດ CORS ເພື່ອໃຫ້ Frontend (React/Vite) ສາມາດກວດດຶງ API ໄດ້
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
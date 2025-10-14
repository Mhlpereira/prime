import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { CustomLogger } from "./logger/custom.logger";

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

    const logger = app.get(CustomLogger)
    app.use(logger);

    const config = new DocumentBuilder()
        .setTitle("Prime Victory")
        .setDescription("Documentation for PV API")
        .setVersion("0.1")
        .addTag("PV")
        .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    await app.listen(3000, "0.0.0.0");
}
bootstrap();

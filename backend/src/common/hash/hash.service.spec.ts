import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { HashService } from "./hash.service";

describe("HashService", () => {
    let service: HashService;
    const saltRounds = 10;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [HashService],
        }).compile();

        service = module.get<HashService>(HashService);
    });

    describe("hash", () => {
        it("should hash a password", async () => {
            const password = "senhaSecreta";
            const hashed = await service.hash(password);

            expect(typeof hashed).toBe("string");
            expect(hashed).not.toEqual(password);
            expect(hashed.length).toBeGreaterThan(0);
        });

        it("should generate unique hashes for the same password", async () => {
            const password = "senhaSecreta";
            const hash1 = await service.hash(password);
            const hash2 = await service.hash(password);

            expect(hash1).not.toBe(hash2);
        });
    });

    describe("compare", () => {
        it("should return true for matching password and hash", async () => {
            const password = "senhaSecreta";
            const hashed = await service.hash(password);

            const compared = await service.compare(password, hashed);
            expect(compared).toBe(true);
        });

        it("should return false for non-matching password", async () => {
            const password = "senhaSecreta";
            const hashed = await service.hash(password);

            const result = await service.compare("senhaErrada", hashed);
            expect(result).toBe(false);
        });
    });
});

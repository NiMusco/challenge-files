"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileAccess = void 0;
const typeorm_1 = require("typeorm");
const file_entity_1 = require("./file.entity");
const user_entity_1 = require("../auth/user.entity");
let FileAccess = class FileAccess {
};
exports.FileAccess = FileAccess;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FileAccess.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => file_entity_1.File, (file) => file.accesses),
    __metadata("design:type", file_entity_1.File)
], FileAccess.prototype, "file", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], FileAccess.prototype, "user", void 0);
exports.FileAccess = FileAccess = __decorate([
    (0, typeorm_1.Entity)()
], FileAccess);
//# sourceMappingURL=fileAccess.entity.js.map
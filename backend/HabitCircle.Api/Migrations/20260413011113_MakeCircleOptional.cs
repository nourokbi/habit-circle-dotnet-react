using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HabitCircle.Api.Migrations
{
    /// <inheritdoc />
    public partial class MakeCircleOptional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Habits_Circles_CircleId",
                table: "Habits");

            migrationBuilder.AlterColumn<Guid>(
                name: "CircleId",
                table: "Habits",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_Habits_Circles_CircleId",
                table: "Habits",
                column: "CircleId",
                principalTable: "Circles",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Habits_Circles_CircleId",
                table: "Habits");

            migrationBuilder.AlterColumn<Guid>(
                name: "CircleId",
                table: "Habits",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Habits_Circles_CircleId",
                table: "Habits",
                column: "CircleId",
                principalTable: "Circles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

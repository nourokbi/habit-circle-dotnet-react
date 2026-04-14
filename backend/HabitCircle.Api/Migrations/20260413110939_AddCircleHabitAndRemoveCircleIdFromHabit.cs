using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HabitCircle.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCircleHabitAndRemoveCircleIdFromHabit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Habits_Circles_CircleId",
                table: "Habits");

            migrationBuilder.DropIndex(
                name: "IX_Habits_CircleId",
                table: "Habits");

            migrationBuilder.DropColumn(
                name: "CircleId",
                table: "Habits");

            migrationBuilder.CreateTable(
                name: "CircleHabits",
                columns: table => new
                {
                    HabitId = table.Column<Guid>(type: "uuid", nullable: false),
                    CircleId = table.Column<Guid>(type: "uuid", nullable: false),
                    SharedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CircleHabits", x => new { x.HabitId, x.CircleId });
                    table.ForeignKey(
                        name: "FK_CircleHabits_Circles_CircleId",
                        column: x => x.CircleId,
                        principalTable: "Circles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CircleHabits_Habits_HabitId",
                        column: x => x.HabitId,
                        principalTable: "Habits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CircleHabits_CircleId",
                table: "CircleHabits",
                column: "CircleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CircleHabits");

            migrationBuilder.AddColumn<Guid>(
                name: "CircleId",
                table: "Habits",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Habits_CircleId",
                table: "Habits",
                column: "CircleId");

            migrationBuilder.AddForeignKey(
                name: "FK_Habits_Circles_CircleId",
                table: "Habits",
                column: "CircleId",
                principalTable: "Circles",
                principalColumn: "Id");
        }
    }
}

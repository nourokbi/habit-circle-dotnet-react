using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HabitCircle.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixCircleCreatedByForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Circles_Users_CreatedById",
                table: "Circles");

            migrationBuilder.DropIndex(
                name: "IX_Circles_CreatedById",
                table: "Circles");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "Circles");

            migrationBuilder.CreateIndex(
                name: "IX_Circles_CreatedByUserId",
                table: "Circles",
                column: "CreatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Circles_Users_CreatedByUserId",
                table: "Circles",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Circles_Users_CreatedByUserId",
                table: "Circles");

            migrationBuilder.DropIndex(
                name: "IX_Circles_CreatedByUserId",
                table: "Circles");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedById",
                table: "Circles",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Circles_CreatedById",
                table: "Circles",
                column: "CreatedById");

            migrationBuilder.AddForeignKey(
                name: "FK_Circles_Users_CreatedById",
                table: "Circles",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

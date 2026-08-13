using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MirajOfIcarus.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AdministrationSecurity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "role",
                table: "accounts",
                type: "character varying(24)",
                maxLength: 24,
                nullable: false,
                defaultValue: "Player");

            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "accounts",
                type: "character varying(24)",
                maxLength: 24,
                nullable: false,
                defaultValue: "Active");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "suspended_at",
                table: "accounts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "suspension_reason",
                table: "accounts",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "administration_audit",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    administrator_account_id = table.Column<long>(type: "bigint", nullable: false),
                    action = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    target = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    details = table.Column<string>(type: "jsonb", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_administration_audit", x => x.id);
                    table.ForeignKey(
                        name: "FK_administration_audit_accounts_administrator_account_id",
                        column: x => x.administrator_account_id,
                        principalTable: "accounts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "game_server_overrides",
                columns: table => new
                {
                    server_id = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    maintenance = table.Column<bool>(type: "boolean", nullable: false),
                    message = table.Column<string>(type: "character varying(240)", maxLength: 240, nullable: true),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_by_account_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_server_overrides", x => x.server_id);
                    table.ForeignKey(
                        name: "FK_game_server_overrides_accounts_updated_by_account_id",
                        column: x => x.updated_by_account_id,
                        principalTable: "accounts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_administration_audit_administrator_account_id",
                table: "administration_audit",
                column: "administrator_account_id");

            migrationBuilder.CreateIndex(
                name: "IX_administration_audit_created_at",
                table: "administration_audit",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_game_server_overrides_updated_by_account_id",
                table: "game_server_overrides",
                column: "updated_by_account_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "administration_audit");

            migrationBuilder.DropTable(
                name: "game_server_overrides");

            migrationBuilder.DropColumn(
                name: "role",
                table: "accounts");

            migrationBuilder.DropColumn(
                name: "status",
                table: "accounts");

            migrationBuilder.DropColumn(
                name: "suspended_at",
                table: "accounts");

            migrationBuilder.DropColumn(
                name: "suspension_reason",
                table: "accounts");
        }
    }
}

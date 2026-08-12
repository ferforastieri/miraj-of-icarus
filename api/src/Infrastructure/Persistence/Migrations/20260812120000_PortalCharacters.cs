using MirajOfIcarus.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MirajOfIcarus.Infrastructure.Persistence.Migrations;

[DbContext(typeof(PlatformDbContext))]
[Migration("20260812120000_PortalCharacters")]
public sealed class PortalCharacters : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            CREATE TABLE IF NOT EXISTS game_characters (
                id uuid PRIMARY KEY,
                account_id bigint NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
                name varchar(24) NOT NULL,
                normalized_name varchar(24) NOT NULL UNIQUE,
                archetype varchar(16) NOT NULL,
                gender varchar(8) NOT NULL,
                customization jsonb NOT NULL,
                level integer NOT NULL DEFAULT 1,
                created_at timestamptz NOT NULL,
                deletion_scheduled_at timestamptz NULL
            );
            ALTER TABLE game_characters
                ADD COLUMN IF NOT EXISTS deletion_scheduled_at timestamptz NULL;
            CREATE INDEX IF NOT EXISTS ix_game_characters_account_id
                ON game_characters(account_id);
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("ALTER TABLE game_characters DROP COLUMN IF EXISTS deletion_scheduled_at;");
    }
}

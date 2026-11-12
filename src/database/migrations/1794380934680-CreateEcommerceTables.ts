
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEcommerceTables1794380934680
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE products (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(150) NOT NULL,
        description TEXT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        imageUrl VARCHAR(500) NULL,
        createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
          ON UPDATE CURRENT_TIMESTAMP(6),
        isActive TINYINT(1) NOT NULL DEFAULT 1,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE carts (
        cart_id INT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (cart_id),
        UNIQUE KEY uq_carts_user_id (user_id),
        CONSTRAINT fk_carts_user
          FOREIGN KEY (user_id) REFERENCES users(user_id)
          ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE cart_items (
        cart_item_id INT NOT NULL AUTO_INCREMENT,
        cart_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        selected_size VARCHAR(20) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (cart_item_id),
        UNIQUE KEY uq_cart_product_size (cart_id, product_id, selected_size),
        CONSTRAINT fk_cart_items_cart
          FOREIGN KEY (cart_id) REFERENCES carts(cart_id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_cart_items_product
          FOREIGN KEY (product_id) REFERENCES products(id)
          ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS cart_items');
    await queryRunner.query('DROP TABLE IF EXISTS carts');
    await queryRunner.query('DROP TABLE IF EXISTS products');
  }
}

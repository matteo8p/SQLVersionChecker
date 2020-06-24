CREATE TABLE IF NOT EXISTS emergency_notification_order_detail
(
  `typed_order_id`    INT(11) PRIMARY KEY NOT NULL,
  `order_id`          VARCHAR(36)         NOT NULL,
  `customer_order_id` VARCHAR(255)        NULL,
  `processing_status` VARCHAR(10)         NOT NULL,
  FOREIGN KEY (typed_order_id) REFERENCES `typed_order` (id)
)
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8;
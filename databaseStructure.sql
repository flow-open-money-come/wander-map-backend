/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `article_tag_map`
--

DROP TABLE IF EXISTS `article_tag_map`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `article_tag_map` (
  `article_id` int unsigned NOT NULL,
  `tag_id` int unsigned NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`article_id`,`tag_id`),
  KEY `fk_article_tag_map_tag_id_idx` (`tag_id`),
  CONSTRAINT `fk_article_tag_map_article_id` FOREIGN KEY (`article_id`) REFERENCES `articles` (`article_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_article_tag_map_tag_id` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`tag_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `article_trail_map`
--

DROP TABLE IF EXISTS `article_trail_map`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `article_trail_map` (
  `article_id` int unsigned NOT NULL,
  `trail_id` int unsigned NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`trail_id`,`article_id`),
  KEY `fk_article_trail_map_article_id_idx` (`article_id`),
  CONSTRAINT `fk_article_trail_map_article_id` FOREIGN KEY (`article_id`) REFERENCES `articles` (`article_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_article_trail_map_trail_id` FOREIGN KEY (`trail_id`) REFERENCES `trails` (`trail_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `articles`
--

DROP TABLE IF EXISTS `articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articles` (
  `article_id` int unsigned NOT NULL AUTO_INCREMENT,
  `author_id` int unsigned NOT NULL,
  `title` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `content` text NOT NULL,
  `location` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '例如 ''南投縣仁愛鄉''',
  `coordinate` point DEFAULT NULL COMMENT '(long, lat)',
  `altitude` smallint DEFAULT NULL COMMENT '單位: 公尺',
  `length` float DEFAULT NULL COMMENT '單位: 公里',
  `departure_time` datetime DEFAULT NULL COMMENT '出發時間',
  `end_time` datetime DEFAULT NULL COMMENT '結束時間',
  `time_spent` smallint DEFAULT NULL COMMENT '花費時間',
  `cover_picture_url` varchar(2083) DEFAULT 'https://tinyurl.com/uuhzmarr',
  `gpx_url` varchar(2083) DEFAULT NULL,
  `views` int NOT NULL DEFAULT '0',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`article_id`),
  KEY `fk_article_author_id_idx` (`author_id`),
  CONSTRAINT `fk_article_author_id` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `collects`
--

DROP TABLE IF EXISTS `collects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collects` (
  `user_id` int unsigned NOT NULL,
  `trail_id` int unsigned NOT NULL,
  PRIMARY KEY (`user_id`,`trail_id`),
  KEY `fk_collect_trail_id_idx` (`trail_id`),
  CONSTRAINT `fk_collect_trail_id` FOREIGN KEY (`trail_id`) REFERENCES `trails` (`trail_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_collect_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `comment_id` int unsigned NOT NULL AUTO_INCREMENT,
  `trail_id` int unsigned NOT NULL,
  `author_id` int unsigned NOT NULL,
  `content` text NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  KEY `fk_comment_trail_id_idx` (`trail_id`),
  KEY `fk_comment_author_id_idx` (`author_id`),
  CONSTRAINT `fk_comment_author_id` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_comment_trail_id` FOREIGN KEY (`trail_id`) REFERENCES `trails` (`trail_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `user_id` int unsigned NOT NULL,
  `article_id` int unsigned NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`article_id`),
  KEY `fk_like_article_id_idx` (`article_id`),
  CONSTRAINT `fk_like_article_id` FOREIGN KEY (`article_id`) REFERENCES `articles` (`article_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_like_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `message_id` int unsigned NOT NULL AUTO_INCREMENT,
  `author_id` int unsigned NOT NULL,
  `article_id` int unsigned NOT NULL,
  `content` text NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`),
  KEY `fk_message_article_id_idx` (`article_id`),
  KEY `fk_message_author_id_idx` (`author_id`),
  CONSTRAINT `fk_message_article_id` FOREIGN KEY (`article_id`) REFERENCES `articles` (`article_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_message_author_id` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `user_id` int NOT NULL,
  `refresh_token` char(64) NOT NULL,
  `expired_at` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `user_id_UNIQUE` (`user_id`),
  UNIQUE KEY `refresh_token_UNIQUE` (`refresh_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `tag_id` int unsigned NOT NULL AUTO_INCREMENT,
  `tag_name` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`tag_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='tag name: 一日、多日、登山小白體驗、專業老手分享、海景、城市景色、夜景、賞花、山景、稀有動植物、有水源、危險地形、需專業裝備、有 GPX（P2）';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `todos`
--

DROP TABLE IF EXISTS `todos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `todos` (
  `todo_id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `content` varchar(512) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `is_done` tinyint(1) NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`todo_id`),
  KEY `fk_todo_user_id_idx` (`user_id`),
  CONSTRAINT `fk__todo_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trails`
--

DROP TABLE IF EXISTS `trails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trails` (
  `trail_id` int unsigned NOT NULL AUTO_INCREMENT,
  `author_id` int unsigned NOT NULL,
  `title` varchar(256) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `description` text NOT NULL,
  `location` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '例如 ''南投縣仁愛鄉''',
  `coordinate` point NOT NULL COMMENT '(long, lat)',
  `altitude` smallint NOT NULL COMMENT '單位: 公尺',
  `length` float DEFAULT NULL COMMENT '單位: 公里',
  `season` varchar(32) DEFAULT NULL,
  `difficulty` enum('新手','入門','進階','挑戰','困難') DEFAULT NULL,
  `cover_picture_url` varchar(2083) DEFAULT NULL,
  `map_picture_url` varchar(2083) DEFAULT NULL,
  `required_time` varchar(32) DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `situation` varchar(256) DEFAULT NULL,
  `gpx_url` varchar(2083) DEFAULT NULL,
  `views` int DEFAULT '0',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`trail_id`),
  KEY `fk_trail_author_id_idx` (`author_id`),
  CONSTRAINT `fk_trail_author_id` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int unsigned NOT NULL AUTO_INCREMENT,
  `nickname` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `email` varchar(320) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `icon_url` varchar(2083) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'https://i.imgur.com/r50z0vv.png',
  `role` enum('admin','member','suspended') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'member',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

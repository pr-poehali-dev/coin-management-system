-- Создание таблиц для централизованного хранения данных

-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Админ', 'Модер', 'Пользователь')),
    balance DECIMAL(20, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица валют
CREATE TABLE currencies (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    rate DECIMAL(20, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица монет
CREATE TABLE coins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(50) UNIQUE NOT NULL,
    value DECIMAL(20, 2) NOT NULL,
    change DECIMAL(10, 2) DEFAULT 0,
    volume BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица настроек (глобальные настройки системы)
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    site_name VARCHAR(255) DEFAULT 'Мониторинг валют',
    active_currency VARCHAR(10) DEFAULT 'USD',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка начальных данных
INSERT INTO currencies (code, symbol, rate) VALUES 
    ('USD', '$', 1),
    ('EUR', '€', 0.92),
    ('RUB', '₽', 92);

INSERT INTO coins (name, symbol, value, change, volume) VALUES 
    ('Bitcoin', 'BTC', 67420, 2.5, 28500000000),
    ('Ethereum', 'ETH', 3240, -1.2, 15200000000),
    ('Solana', 'SOL', 145, 5.8, 2400000000);

INSERT INTO settings (site_name, active_currency) VALUES 
    ('Мониторинг валют', 'USD');
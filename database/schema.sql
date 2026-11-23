CREATE DATABASE IF NOT EXISTS jlservisoft;
USE jlservisoft;
CREATE TABLE IF NOT EXISTS clientes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tipo_documento VARCHAR(15) NOT NULL,
    numero_documento VARCHAR(30) NOT NULL,
    digito_verificacion VARCHAR(2),
    razon_social VARCHAR(150),
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    correo VARCHAR(150),
    telefono VARCHAR(30),
    direccion VARCHAR(200),
    ciudad VARCHAR(100),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_cliente_documento (
        tipo_documento,
        numero_documento
    )
);
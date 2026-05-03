DROP TABLE IF EXISTS periferice;

DROP TYPE IF EXISTS categ_echipamente cascade;
DROP TYPE IF EXISTS tipuri_produse cascade;

CREATE TYPE categ_echipamente AS ENUM('tastatura', 'mouse', 'casti', 'mousepad', 'controller','comuna');
CREATE TYPE tipuri_produse AS ENUM('wired', 'wireless','NA','mecanica','membrana','gaming','office');


CREATE TABLE IF NOT EXISTS periferice (
   id serial PRIMARY KEY,
   nume VARCHAR(50) UNIQUE NOT NULL,
   descriere TEXT,
   pret NUMERIC(8,2) NOT NULL,
   masa INT NOT NULL CHECK (masa>=0),   
   tip_produs tipuri_produse DEFAULT 'NA',
   categorie categ_echipamente DEFAULT 'comuna',
   materiale VARCHAR [],
   pt_gaming BOOLEAN NOT NULL DEFAULT FALSE,
   imagine VARCHAR(300),
   data_adaugare TIMESTAMP DEFAULT current_timestamp
);

INSERT INTO periferice (nume, descriere, pret, masa, tip_produs, categorie, materiale, pt_gaming, imagine) VALUES
('Logitech G Pro X TKL', 'Tastatura mecanica gaming tenkeyless.', 599.99, 980, 'mecanica', 'tastatura', ARRAY['plastic', 'aluminiu', 'switch-uri'], TRUE, 'logitech_gpro_tk1.jpg'),
('Razer DeathAdder V3', 'Mouse ergonomic foarte usor.', 350.50, 59, 'wired', 'mouse', ARRAY['plastic', 'cauciuc'], TRUE, 'razer_dav3.jpg'),
('HyperX Cloud II Wireless', 'Casti gaming wireless cu sunet 7.1.', 699.00, 300, 'wireless', 'casti', ARRAY['aluminiu', 'spuma cu memorie', 'piele sintetica'], TRUE, 'hyperx_cloud2_w1.jpg'),
('SteelSeries QcK Heavy', 'Mousepad textil gros, baza aderenta.', 120.00, 400, 'NA', 'mousepad', ARRAY['textil', 'cauciuc'], TRUE, 'ss_qck_heavy.jpg'),
('Xbox Elite Series 2', 'Controller premium pentru PC si Xbox.', 850.99, 345, 'wireless', 'controller', ARRAY['plastic', 'metal', 'cauciuc'], TRUE, 'xbox_elite2.jpg'),
('Keychron Q1 Pro', 'Tastatura mecanica customizabila 75%.', 950.00, 1736, 'mecanica', 'tastatura', ARRAY['aluminiu CNC', 'plastic PBT'], TRUE, 'keychron_q1pro.jpg'),
('Logitech MX Master 3S', 'Mouse office ergonomic avansat.', 550.00, 141, 'wireless', 'mouse', ARRAY['plastic', 'metal', 'cauciuc'], FALSE, 'mx_master_3s.jpg'),
('Sony DualSense Edge', 'Controller pro pentru PlayStation 5 si PC.', 1100.00, 325, 'wireless', 'controller', ARRAY['plastic', 'cauciuc', 'metal'], TRUE, 'dualsense_edge.jpg'),
('Corsair Virtuoso RGB', 'Casti premium high-fidelity.', 999.99, 380, 'wireless', 'casti', ARRAY['aluminiu', 'piele', 'plastic'], TRUE, 'corsair_virtuoso.jpg'),
('Razer Gigantus V2', 'Mousepad gaming de dimensiuni mari.', 149.99, 450, 'NA', 'mousepad', ARRAY['textil micro-texturat', 'spuma cauciucata'], TRUE, 'razer_gigantus_v2.jpg'),
('Logitech G502 Hero', 'Mouse gaming popular ajustabil cu greutati.', 250.00, 121, 'wired', 'mouse', ARRAY['plastic', 'metal', 'cauciuc'], TRUE, 'g502_hero.jpg'),
('Ducky One 3 Mini', 'Tastatura mecanica 60% hot-swappable.', 720.00, 600, 'mecanica', 'tastatura', ARRAY['plastic PBT', 'silicon'], TRUE, 'ducky_one3_mini.jpg'),
('SteelSeries Arctis Nova Pro', 'Sistem audio de inalta fidelitate.', 1250.00, 338, 'wired', 'casti', ARRAY['otel', 'aluminiu', 'piele sintetica'], TRUE, 'arctis_nova_pro.jpg'),
('Glorious Model O Wireless', 'Mouse ultra-usor cu model fagure.', 420.00, 69, 'wireless', 'mouse', ARRAY['plastic ABS', 'PTFE'], TRUE, 'glorious_model_o_wl.jpg'),
('Zowie EC2-C', 'Mouse ergonomic apreciat pentru esports.', 340.00, 73, 'wired', 'mouse', ARRAY['plastic'], TRUE, 'zowie_ec2c.jpg'),
('Corsair K70 RGB PRO', 'Tastatura mecanica full-size cu palm rest.', 850.50, 1150, 'mecanica', 'tastatura', ARRAY['aluminiu periat', 'plastic PBT'], TRUE, 'corsair_k70_pro.jpg'),
('Razer BlackShark V2', 'Casti usoare destinate jucatorilor pro de esports.', 399.99, 240, 'wired', 'casti', ARRAY['plastic', 'spuma cu memorie'], TRUE, 'razer_blackshark_v2.jpg'),
('Artisan Zero Soft', 'Mousepad premium fabricat in Japonia.', 350.00, 300, 'NA', 'mousepad', ARRAY['poliester tricotat', 'burete poliuretanic'], TRUE, 'artisan_zero.jpg'),
('Nintendo Pro Controller', 'Controller oficial pentru Switch, extrem de durabil.', 350.00, 246, 'wireless', 'controller', ARRAY['plastic transparent'], TRUE, 'switch_pro_controller.jpg'),
('Logitech MX Keys', 'Tastatura low-profile pentru productivitate si programare.', 530.00, 810, 'membrana', 'tastatura', ARRAY['metal', 'plastic'], FALSE, 'logitech_mx_keys.jpg'),
('Asus ROG Harpe Ace', 'Mouse wireless ultra-usor co-dezvoltat cu jucatori pro.', 690.00, 54, 'wireless', 'mouse', ARRAY['nylon bio-based', 'PTFE'], TRUE, 'rog_harpe_ace.jpg'),
('EPOS H6PRO', 'Casti acustice inchise pentru imersiune si claritate.', 899.00, 322, 'wired', 'casti', ARRAY['metal', 'plastic', 'catifea'], TRUE, 'epos_h6pro.jpg'),
('Lethal Gaming Saturn Pro', 'Mousepad orientat spre control, ideal pentru FPS-uri tactice.', 280.00, 420, 'NA', 'mousepad', ARRAY['textil de precizie', 'baza poron'], TRUE, 'lgg_saturn_pro.jpg'),
('8BitDo Ultimate Bluetooth', 'Controller versatil compatibil cu multiple platforme.', 320.00, 228, 'wireless', 'controller', ARRAY['plastic', 'senzori magnetici'], TRUE, '8bitdo_ultimate.jpg'),
('Wooting 60HE', 'Tastatura revolutionara cu switch-uri analogice magnetice.', 950.00, 605, 'mecanica', 'tastatura', ARRAY['plastic ABS', 'otel'], TRUE, 'wooting_60he.jpg'),
('Endgame Gear XM2we', 'Mouse wireless claw-grip de inalta performanta si switch-uri optice.', 410.00, 63, 'wireless', 'mouse', ARRAY['plastic dry-grip', 'PTFE'], TRUE, 'xm2we.jpg'),
('Audio-Technica ATH-M50xSTS', 'Headset de streaming dedicat cu microfon cardioid.', 990.00, 330, 'wired', 'casti', ARRAY['plastic', 'metal'], TRUE, 'ath_m50xsts.jpg'),
('Xtrfy GP4', 'Mousepad cu design artistic original si glide fluid.', 160.00, 350, 'NA', 'mousepad', ARRAY['textil', 'cauciuc natural'], TRUE, 'xtrfy_gp4.jpg'),
('Scuf Reflex Pro', 'Controller personalizat de inalta performanta.', 1300.00, 300, 'wireless', 'controller', ARRAY['plastic', 'metal', 'cauciuc texturat'], TRUE, 'scuf_reflex.jpg'),
('Royal Kludge RK61', 'Tastatura mecanica de 60% tip buget.', 250.00, 500, 'mecanica', 'tastatura', ARRAY['plastic ABS'], TRUE, 'rk61.jpg');

GRANT CONNECT ON DATABASE gearlab TO ciobo;
GRANT USAGE ON SCHEMA public TO ciobo;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ciobo;
GRANT SELECT ON TABLE periferice TO ciobo;

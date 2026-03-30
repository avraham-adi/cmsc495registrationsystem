INSERT INTO `admins` (`user_id`, `access_level`)
SELECT `user_id`, 10
FROM `users`
WHERE `email` = 'horne_chri87@gmail.com';

INSERT INTO `professors` (`user_id`, `department`)
SELECT `user_id`, 'Computer Science'
FROM `users`
WHERE `email` IN (
    'wolff_toto00@gmail.com',
    'vowle_jame00@gmail.com',
    'brown_zak00@gmail.com'
);

INSERT INTO `students` (`user_id`, `major`)
SELECT `user_id`, 'Computer Science'
FROM `users`
WHERE `email` IN (
    'verst_max1@gmail.com',
    'perez_serg11@gmail.com',
    'hamil_lewi44@gmail.com',
    'russe_geor63@gmail.com',
    'lecle_char16@gmail.com',
    'sainz_carl55@gmail.com',
    'norri_land4@gmail.com',
    'piast_osca81@gmail.com',
    'alons_fern14@gmail.com',
    'strol_lanc18@gmail.com',
    'gasly_pierr10@gmail.com',
    'ocon_este31@gmail.com',
    'tsuno_yuki22@gmail.com',
    'ricci_dani3@gmail.com',
    'botta_valt77@gmail.com',
    'zhou_guan24@gmail.com',
    'magnu_kevi20@gmail.com',
    'hulke_nico27@gmail.com',
    'albon_alex23@gmail.com',
    'sarge_loga2@gmail.com',
    'devri_nyck21@gmail.com',
    'lawso_liam40@gmail.com',
    'raikk_kimi7@gmail.com',
    'vette_seba5@gmail.com',
    'butto_jens22@gmail.com',
    'rosbe_nico6@gmail.com',
    'massa_feli19@gmail.com',
    'barri_rube11@gmail.com',
    'schum_mich47@gmail.com',
    'schum_mick47@gmail.com',
    'grosj_roma8@gmail.com',
    'maldo_past18@gmail.com',
    'senna_ayrt12@gmail.com',
    'prost_alai1@gmail.com',
    'lauda_niki12@gmail.com',
    'berge_gerh28@gmail.com',
    'coult_davi2@gmail.com',
    'hakki_mika8@gmail.com',
    'ville_jacq27@gmail.com',
    'monto_juan42@gmail.com',
    'anton_kimi12@gmail.com',
    'bearm_oliv87@gmail.com',
    'dooha_jack7@gmail.com',
    'pourd_theo5@gmail.com',
    'ilott_call12@gmail.com',
    'kubic_robe88@gmail.com'
);
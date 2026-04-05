-- Consolidated seed data for registrationdb
USE `registrationdb`;

SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM `prerequisites`;
DELETE FROM `enrollments`;
DELETE FROM `sections`;
DELETE FROM `students`;
DELETE FROM `professors`;
DELETE FROM `admins`;
DELETE FROM `semesters`;
DELETE FROM `courses`;
DELETE FROM `users`;
SET FOREIGN_KEY_CHECKS = 1;

ALTER TABLE `users` AUTO_INCREMENT = 1;
ALTER TABLE `admins` AUTO_INCREMENT = 1000;
ALTER TABLE `courses` AUTO_INCREMENT = 1;
ALTER TABLE `professors` AUTO_INCREMENT = 1000;
ALTER TABLE `semesters` AUTO_INCREMENT = 1;
ALTER TABLE `sections` AUTO_INCREMENT = 5500;
ALTER TABLE `students` AUTO_INCREMENT = 10000000;
ALTER TABLE `enrollments` AUTO_INCREMENT = 1;

INSERT INTO `users` (`name`, `email`, `password_hash`, `first_login`) VALUES
('Christian Horner', 'horne_chri87@gmail.com', '$2b$10$C2w4QzmAJrZiePIcjTGZrOpLsqRMHk5AzCujHyk2xT/RR45.NiNkO', '0'),
('Toto Wolff', 'wolff_toto00@gmail.com', '$2b$10$6X9t36ieKXmVr8v8/8nbwO4jRJ9uSgYzQJod/ul8EFp.pdlHj8xGm', 1),
('James Vowles', 'vowle_jame00@gmail.com', '$2b$10$Sp0rGH/DFAVajsvUzCqQj.U2K2Fl8CL7tvrh3lqE4qOV39f5XEvtq', 1),
('Zak Brown', 'brown_zak00@gmail.com', '$2b$10$gT4l/chl8/m2BNGFfDovt.9qqFlYjiUhm3dJsgtueuhd67i16HLYK', 1),
('Max Verstappen', 'verst_max1@gmail.com', '$2b$10$2UWjISYtJXPJZXhd2m70NOBc7xwqgclmaZlN31cCA8noL4/6SLrAu', 1),
('Sergio Perez', 'perez_serg11@gmail.com', '$2b$10$X36PMU93mlGjppwwf/t9dOXuI1f5x3ipbxFaKnKv2UuIW8p1lEAzW', 1),
('Lewis Hamilton', 'hamil_lewi44@gmail.com', '$2b$10$GoZcyaBUrwz7YuYa/cObpeds1ZEhK4xLl/FiJYmebopd3FCxIE77O', 1),
('George Russell', 'russe_geor63@gmail.com', '$2b$10$8hndfyoJjWRknOOyvsFPW.XmQ6XTtvp4SO7bgzBZNGiDkP2o0rkQ.', 1),
('Charles Leclerc', 'lecle_char16@gmail.com', '$2b$10$rg4CFuz7RjtMkVgr.Qld7.h4GYavUmwc5FLm8/I9lFxJXrvGozW8C', 1),
('Carlos Sainz', 'sainz_carl55@gmail.com', '$2b$10$XpcL1f/vkNVOpPvikQkBf.IXZ489Vj0VuZ8wqZEuUaNZBH80gDm6q', 1),
('Lando Norris', 'norri_land4@gmail.com', '$2b$10$EVFk2XZ0vOxjzbmdwV80hOkev0UWDWYJpK2.VAe/H35Ox10Bvw8ky', 1),
('Oscar Piastri', 'piast_osca81@gmail.com', '$2b$10$yjIQvVeaz437rwXsEkUbXudmwkpTQ9unYutkvlSk3HRaOCJirq9y.', 1),
('Fernando Alonso', 'alons_fern14@gmail.com', '$2b$10$Xgz0Yir79/TQvOsHpaMsm.Cm4ZDsxTnVQaigCFhOTr5IpcrqE/gi6', 1),
('Lance Stroll', 'strol_lanc18@gmail.com', '$2b$10$hdXeM5JBjbO8j1o1DV1yd.b/6lESJPa8mQOEtzYYbRuNSwE3LIJNq', 1),
('Pierre Gasly', 'gasly_pierr10@gmail.com', '$2b$10$aQd3vhzB39fWwKExsKpgYeWtHQML1nOdc8Tnt9R4l9NkP2M5uTbxy', 1),
('Esteban Ocon', 'ocon_este31@gmail.com', '$2b$10$Lj9hTHDhRdy0pCRE52pkf.PisK8/OEV4RtBLHI0YnhZi42ZWI.Oxi', 1),
('Yuki Tsunoda', 'tsuno_yuki22@gmail.com', '$2b$10$dgyYnJtpmO2pZGEdZW1Jp.XuZdprfMhrCTrRY9SyEx/eVUFh5tDcq', 1),
('Daniel Ricciardo', 'ricci_dani3@gmail.com', '$2b$10$rlygXht.wkZ2HJKWz6dJTeOhRoI7yhzQCTidPvVMjBEp/MEbmuULS', 1),
('Valtteri Bottas', 'botta_valt77@gmail.com', '$2b$10$k1gVfkYG1gef.IQ6fXF5kulRWmtWJM4bDIZckPd6SS1TpcTjentUG', 1),
('Zhou Guanyu', 'zhou_guan24@gmail.com', '$2b$10$buktFz8/Z6H/bh7mYAMalOGZeBr5WNh.FSWQ2uUSNyxzFpByd37vK', 1),
('Kevin Magnussen', 'magnu_kevi20@gmail.com', '$2b$10$/kfHD22Y49BXa197uNcRsuTcaJ4B93tqs7kJfqQi1PeANGcsoA3G2', 1),
('Nico Hulkenberg', 'hulke_nico27@gmail.com', '$2b$10$41T8bnhuEoNfFbNKzy1IbuOKsf7WWlDwB5uNtooPfNP45O/TUK3Zq', 1),
('Alexander Albon', 'albon_alex23@gmail.com', '$2b$10$YpZxMq/ppJYP235I2ciQT.ZYk48G9bJUtAYv7tgQKFFM4HtNE18xO', 1),
('Logan Sargeant', 'sarge_loga2@gmail.com', '$2b$10$8c6zN2uMSZmGeRIiW.PKBOcr1AppxS3bpDc0xeoORJXn6cXwDmZ1q', 1),
('Nyck de Vries', 'devri_nyck21@gmail.com', '$2b$10$3arr.isOvxphmd1k9Mmgx.Ae38bgBtAOQ1Xp/piOBW6oielBHY0dC', 1),
('Liam Lawson', 'lawso_liam40@gmail.com', '$2b$10$xH8ru9kAzY6m7gb3wATRIuKGY/IBSoZzSW3cVFLvKq/f9eN/3s0jK', 1),
('Kimi Raikkonen', 'raikk_kimi7@gmail.com', '$2b$10$H/j0ksBPCKk.Bhp.GTezceAgLQXwMGe1lkFgVde5vmK/lWe04jGKS', 1),
('Sebastian Vettel', 'vette_seba5@gmail.com', '$2b$10$pNFBmchGa.PMK/kpHlhSM.x68vK.AUojYe/jsqlJR3tUMNxT0W/om', 1),
('Jenson Button', 'butto_jens22@gmail.com', '$2b$10$wyj7pYr/e3DAekEpQW.Oa.typNXpIBhPjywv/AYj/iTjMuoEQTgDy', 1),
('Nico Rosberg', 'rosbe_nico6@gmail.com', '$2b$10$/x.zWSlijqX2B1aMiBigDOLM74Oh0unkzNKw8Peh3bYjRnRV09sFm', 1),
('Felipe Massa', 'massa_feli19@gmail.com', '$2b$10$CcvgpLvtko0Y9Irjy4yD9uZ5NEyaUK3zq6JuOQNHa8hFf69IZDraG', 1),
('Rubens Barrichello', 'barri_rube11@gmail.com', '$2b$10$bD/5WPetdn/RiEYU7Dvno.cY6PE./K2MV.W6N4AgwkSsqsDlmKODa', 1),
('Michael Schumacher', 'schum_mich47@gmail.com', '$2b$10$7MNcNtAgJ7vECIhZ5OIuxef9BZ35S6X97ul78liaPmWlYsHqv4N1K', 1),
('Mick Schumacher', 'schum_mick47@gmail.com', '$2b$10$dkp1JyRwkT7pmMJ4hi/bo.Lu7iyQ3Ez7kovdiy1N7KVTPPQFHWKEa', 1),
('Romain Grosjean', 'grosj_roma8@gmail.com', '$2b$10$4Owk7ALNDai48hzAZN8px.yK4A0G.UDtqsuWyUozmkoowdqR4zrJm', 1),
('Pastor Maldonado', 'maldo_past18@gmail.com', '$2b$10$E5SL/3ygi76ANZ.nwdmg/Ok6dQU2CPXSocCOloSchvNBFPOly5DVi', 1),
('Ayrton Senna', 'senna_ayrt12@gmail.com', '$2b$10$f.hOdcOWI5sRKVDr2DlSJ.MAvCqXIfPDcKrLsJ5o3B99vuQNP9nXC', 1),
('Alain Prost', 'prost_alai1@gmail.com', '$2b$10$fJ0vcTUHHy/fp7/KPWFwEuQlmYfVtWIV8vqbtALKceFmrm/MwAWQW', 1),
('Niki Lauda', 'lauda_niki12@gmail.com', '$2b$10$81EhlPoULk5uOygHpRjr2.cE7JRFaTp.PaYJnI.anJWaN5TG1DGzG', 1),
('Gerhard Berger', 'berge_gerh28@gmail.com', '$2b$10$fVAM0ryrt7xiR504ctvS7.7q.njFdIooyoSB2ZSwgwhuRm6lHGThG', 1),
('David Coulthard', 'coult_davi2@gmail.com', '$2b$10$0pskyuhyCOe1sqF4/WJ.5uXxutu5rk/puKgk.X02joS.46NEp76GG', 1),
('Mika Hakkinen', 'hakki_mika8@gmail.com', '$2b$10$V5/tGooehW4DikV0w.Axv.6QowYCsCslbwuI6kB.hBU8U0B2rHXDm', 1),
('Jacques Villeneuve', 'ville_jacq27@gmail.com', '$2b$10$35BGfllooQCy1bRg9fHh..S6S80ZlOSXGhp5rFl79fKaSfgLh44J.', 1),
('Juan Pablo Montoya', 'monto_juan42@gmail.com', '$2b$10$FzPk/neFkNuhRkjyAnmmeeeS2E/2LDH7M5czVLWUsffUaw5Pii47m', 1),
('Kimi Antonelli', 'anton_kimi12@gmail.com', '$2b$10$LKY6BKiBAbHutAV51DGOGOhF92Ic8Qh429C3XIbxF7lA7UFQMmLcO', 1),
('Oliver Bearman', 'bearm_oliv87@gmail.com', '$2b$10$TEmdtWwBoHNQ.4/nYpAy9uQC/6huG1AnYyLUUgQJft/rAfrMA2Wt2', 1),
('Jack Doohan', 'dooha_jack7@gmail.com', '$2b$10$tU5HNLDgx7Q3wNGB3QlAsuK1UFxzoQ4w1NHbMNJGSLncmAL90jSXW', 1),
('Theo Pourchaire', 'pourd_theo5@gmail.com', '$2b$10$urjuK6pBIrDj7f.9bMTiY.pOwvvuEvsh9kKWOJYxJA5YCgq8ywVgq', 1),
('Callum Ilott', 'ilott_call12@gmail.com', '$2b$10$xQ6JcTXtQoBEQAECCOKNAuL5h2XPz.Uczw7w5XBn1lutM70IRuZN2', 1),
('Robert Kubica', 'kubic_robe88@gmail.com', '$2b$10$E.N2rAlatc0Kyl1W5hpcwey8BWy5MG.0ZxKbxS9graE0xcW7qsRTS', 1),
('Billy Butcher', 'butch_bill17@gmail.com', '$2b$10$lLy8LA6VFJO.FZd6ync9TeOydCVbOc2Ik.7Osazr2LfmzQZWIsM7W', 1),
('Hughie Campbell', 'campb_hugh18@gmail.com', '$2b$10$839VYjyWdkQDA4hkGk/QbOdW87ws5A1SVNRmRaxDa7dDDVRLwTV3S', 1),
('Annie January', 'janua_anni19@gmail.com', '$2b$10$cqSHvhxezgfOdplXc25qnul./Azsb69fpkbfOjzcViQ7A.8lK/71G', 1),
('John Homelander', 'homel_john20@gmail.com', '$2b$10$zLwz1iKfpWWznJUXx8XAQe2WxkOMexxmsyvJAArMD6QRq77r9iL92', 1),
('Maggie Maeve', 'maeve_magg21@gmail.com', '$2b$10$keZFB5rlWCuj/JwS5Hb/LO7YS85D91GlbkFc19JF3AwTAnU3TQJzC', 1),
('Kimiko Miyashiro', 'miyas_kimi22@gmail.com', '$2b$10$me440EPUsfMD4hUHpnHU1.KwYyiT/Q9iEYi0pEq.VEgTIwi2FnYYq', 1),
('Serge Frenchie', 'frenc_serg23@gmail.com', '$2b$10$nW5TVwNEFAbaw6viopHrZuZjFnMBP0kpTwlond5bPTab9pjzW7Uga', 1),
('Marvin Milk', 'milk_marv24@gmail.com', '$2b$10$S4iusxUq18aB1QUYNHQ6wOk19PTS43RJwRIwMMgIj9SgjR/ZIbSU6', 1),
('Ben Soldier', 'soldi_ben25@gmail.com', '$2b$10$vypN7bUvCR4vHxx0jJ3P5u7jVsnPcQy6ogeIPgTVmACLZVHObrDry', 1),
('Victoria Neuman', 'neuma_vict26@gmail.com', '$2b$10$Q7jA7sczXJcQ857mCfHMLuOKLlrJRNDlRclqMY5NbT6JLfTlFoTN6', 1),
('Ashley Barrett', 'barre_ashl27@gmail.com', '$2b$10$Yrgew4JbRbtyaurRlcYPEOwag/NZKdV.VJz1OPSmRGMbGHRT9RnNK', 1),
('Reggie Franklin', 'frank_regg28@gmail.com', '$2b$10$RkV/LHXC1o4oUyuR3sE/neWXffqEOAqc6lCBDEI8kxYmfaZbuFUG.', 1),
('Earving Noir', 'noir_earv29@gmail.com', '$2b$10$bXYJo5k4ipmNYTxCh7fvDOJ6fPRNsfQlK2ct5aKJhNOxHzUNtkHDq', 1),
('Kevin Moskowitz', 'mosko_kevi30@gmail.com', '$2b$10$dOH3H9Vd4/1RIxMczALgqO34rGd9Ff32YymLTUlGdmre/oJg8mm7S', 1),
('Ryan Butcher', 'butch_ryan31@gmail.com', '$2b$10$dPC70w6Cc9Koca30Q947WOv4NdjEG9of3DPBzCFImR8XAxosbadh6', 1),
('Cindy Campbell', 'campb_cind32@gmail.com', '$2b$10$tCSkXF5rjOi7d.NGE5IDNOvTar6PypnZZOTTAWNbyP2HscOvh1nMu', 1),
('Brenda Meeks', 'meeks_bren33@gmail.com', '$2b$10$IVtnCp8sT.I21csLT1mfG.Nq27WxcC4nkFrbQX5/bTiTs.QfLsG2q', 1),
('Shorty Meeks', 'meeks_shor34@gmail.com', '$2b$10$XgeTeltt5kokKHrVm6EQHuKgXLimmeScdNb.SUeMctsMlLF9iFv1G', 1),
('Ray Wilkins', 'wilki_ray35@gmail.com', '$2b$10$Y0rB9TLD4ALAAlGBOttzUOzNNn/YiU1Xo4rzUiuwOXd2MhfAhhufu', 1),
('Bobby Prinze', 'prinz_bobb36@gmail.com', '$2b$10$chbD7FI5YlTjD791gedwJudYb4lFqRP0l9nMxI0pw0n0pTaAUC7Xq', 1),
('Buffy Gilmore', 'gilmo_buff37@gmail.com', '$2b$10$UzDyWAy/upFMK5sVCCF0vupBOOZt62pamF1DrbnKUAad/F8W17uWm', 1),
('Greg Phillippe', 'phill_greg38@gmail.com', '$2b$10$37JlEcET5HduA975zIwCl.ojM02WfvBAw3nAFwdHHbY2dk1faxO.O', 1),
('Doofy Gilmore', 'gilmo_doof39@gmail.com', '$2b$10$wVHA0UVr45VQ.FIIbjQo1.VLYXoW7T478wm1RCW.2CQ9Xazk4Bdqu', 1),
('Gail Hailstorm', 'hails_gail40@gmail.com', '$2b$10$XvREeDCT2zvwCEKxfUADjemxlTdOteYV8BGA/MLxgpmnVhp1yE.bK', 1),
('Dwight Hartman', 'hartm_dwig41@gmail.com', '$2b$10$n1uEtKvGnpOtThOU4N0swuQvdriZ5PzNbr5ogBcY.HUR1Ie9Ta0zm', 1),
('Jane Hopper', 'hoppe_jane42@gmail.com', '$2b$10$Wrb20xs8hz4b5mPOSxZJ1.48.s.x.7q0Kj8fV1XU1Ssu8KoM2mL/G', 1),
('Mike Wheeler', 'wheel_mike43@gmail.com', '$2b$10$S8QfXKxSlN0c4dm3j2FaAu5Sujd2gVwEXI2qP8y.nJWCYfwLPNZ2e', 1),
('Dustin Henderson', 'hende_dust44@gmail.com', '$2b$10$vYTslvo8yZ4YRRIaJFa0gubE9ncJAwL/VR7IkXhA94bgn6bTzBwKe', 1),
('Lucas Sinclair', 'sincl_luca45@gmail.com', '$2b$10$W8MdQb/lV2dAdHAFLX0t0eNTUavC32RI4ISaEWKs7zQ7kWOs0dnzS', 1),
('Max Mayfield', 'mayfi_max46@gmail.com', '$2b$10$tKGrUvSvt27AbYLWAI6wQenF8JZGwh4R4fC1yDPZCbiw9iBsamQ0.', 1),
('Will Byers', 'byers_will47@gmail.com', '$2b$10$TaY5cDe7GB/qxpazRzZtdelghxnhuoaFfmCb0uDwSFY7S6irPxvmK', 1),
('Nancy Wheeler', 'wheel_nanc48@gmail.com', '$2b$10$Zyr0XnxXacns8D/2JBsEh.2aY4iPdnmO9e4Dugvo8P3GPItFLlJBW', 1),
('Jonathan Byers', 'byers_jona49@gmail.com', '$2b$10$1kn2zToZ7bPDxcBxRC10rOvyebHWxmEQwLs7quqHHXC283pns0Sg.', 1),
('Steve Harrington', 'harri_stev50@gmail.com', '$2b$10$qcvMpGFq4Noq5tKduM/IL.okzXBlSf2Y3FAfQm/e/4XLYRDbR9l0u', 1),
('Robin Buckley', 'buckl_robi51@gmail.com', '$2b$10$ZOwnazcVsItynEnY7FzcW.q3BzBeSMeEMGW5qvff.6RJH8MYIorci', 1),
('Jim Hopper', 'hoppe_jim52@gmail.com', '$2b$10$KZqIdMYOoMZ4.wpMxLtdwezBzpiIV481gTYyPEjd1lg/q6r2DlsAC', 1),
('Joyce Byers', 'byers_joyc53@gmail.com', '$2b$10$iL/YImUjaAlcNSxIy1o0hu0QfzB.jMqz96SfNsWgd2UA.p0BUHxsa', 1),
('Eddie Munson', 'munso_eddi54@gmail.com', '$2b$10$Pmdv4qAKyUkDgO8JkbVDhuIBZnXnjcVeTYyvIKItOkzg2vf9Bie92', 1),
('Murray Bauman', 'bauma_murr55@gmail.com', '$2b$10$.RzDWkw9SHL7Y9xfiWwuee/gWB2QafWEGArSnKIs8VUsSUimMHA6q', 1),
('Erica Sinclair', 'sincl_eric56@gmail.com', '$2b$10$Crz.wiZv4AosHBSifzNxcO0VMDzIdpzl3G5s1pB/lUxRxuvOBTXle', 1),
('Wednesday Addams', 'addam_wedn57@gmail.com', '$2b$10$fJ/5PddPxiKuzYi201CjO.akhUj.nZfFofl2xRJVVid67pqKXEk1O', 1),
('Enid Sinclair', 'sincl_enid58@gmail.com', '$2b$10$LEC1EQ7sudDDS9wpirPfSeOCJMkSFMuqKIgmp5Ww3soMHoSjJXJty', 1),
('Bianca Barclay', 'barcl_bian59@gmail.com', '$2b$10$MBh7uJGb7iiWtOWf.kBdruQANQg4LlY3Kn207MEp2BVKvT9WbZl3C', 1),
('Xavier Thorpe', 'thorp_xavi60@gmail.com', '$2b$10$Ts3vC8GE5ei4Wg4IcvtbrOZZaV6x6RaJ4jX9gnrmdo5Vb561qZr5S', 1),
('Tyler Galpin', 'galpi_tyle61@gmail.com', '$2b$10$w4LxcUwU9U68ZfgtkVNBK.3w1C7UD50ps0DAcjX2Cd3.1B2OzMCle', 1),
('Eugene Otinger', 'oting_euge62@gmail.com', '$2b$10$Buxp1B2gMYKmTJRjCIhzgODEzLK9OswvzYTLCZQB8sfxQQte44AT2', 1),
('Morticia Addams', 'addam_mort63@gmail.com', '$2b$10$Yb5yzCUloX1DQTVcPJiM8.k5qTvX88GzHiQMJx6iwfI0MBPu0hEZS', 1),
('Gomez Addams', 'addam_gome64@gmail.com', '$2b$10$pkrZxOc7Yo.itMd0ZwamseFlGC0VoqJUkHXSMQA6SqoC3AlioaE8u', 1),
('Pugsley Addams', 'addam_pugs65@gmail.com', '$2b$10$UV0pz/xw0N7pBW2KB8e3Y.ySE.eUoey3y7Nx0/yFp9KuGEYN2PBBS', 1),
('Larissa Weems', 'weems_lari66@gmail.com', '$2b$10$PvbX1pSsD6A0XRuzswi1kuiO5U/nWNVSHi51TczGhLsZM4gMo5nbG', 1),
('Joel Miller', 'mille_joel67@gmail.com', '$2b$10$lDlGmjixDSe2VodgejyJLeTNe8O2AepXWtD0k7NsQffr.x9y7qxVC', 1),
('Ellie Williams', 'willi_elli68@gmail.com', '$2b$10$AGAJkyVBhvbCGHBJ9JJW3.EOzLszH3ycNBuXj8pQozE8Fm171GMdW', 1),
('Tommy Miller', 'mille_tomm69@gmail.com', '$2b$10$N.qVJnJe/HLtYio0CLrhk.V4mH0GP3E1gImurBPWMX8hf3Yz8.g1.', 1),
('Sarah Miller', 'mille_sara70@gmail.com', '$2b$10$eJ9rVKTL0DSnA/WxOxiHkOjN8wLJFoeAFHRFMB871dp.BJC8PhaCa', 1),
('Tess Servopoulos', 'servo_tess71@gmail.com', '$2b$10$nOZtmiP9/EzVCGSrhRIEnOLa7JgOuM4UWGrZJIuNDr7asrHMXD1UW', 1),
('Marlene Stone', 'stone_marl72@gmail.com', '$2b$10$J8bT4HSAVEylNtHx4dVuYOfRNfHruX5x6QeXjLoYh71HLix4Q38XG', 1),
('Bill Franklin', 'frank_bill73@gmail.com', '$2b$10$I6JketmZaQ4UnpElnesxAuUBrPzGIBcjJeP3NebUWJD41d59rbP1u', 1),
('Frank Franklin', 'frank_fran74@gmail.com', '$2b$10$IXFcgNyTh/uZOd5R/.S1YO2eODfsqdu9IFayg7GzZmXlEe6ZpNFne', 1),
('Abby Anderson', 'ander_abby75@gmail.com', '$2b$10$cRG2SSl6HyDQxuHTKwVpm.8IaPJQW0pWWO8vgI/viKoNpV7tLfMhy', 1),
('Dina Alvarez', 'alvar_dina76@gmail.com', '$2b$10$kJoyaSBzO5nSXCbBqyk1zOj5Oe1SqQCmB5Q7JMU2YRthGCVR32W1a', 1),
('Rhaenyra Targaryen', 'targa_rhae77@gmail.com', '$2b$10$BllWi2dflVRfw28C1RvzkuKL3QucbipwubdYNZGCTDUI5.ulmaL0a', 1),
('Daemon Targaryen', 'targa_daem78@gmail.com', '$2b$10$FedSHVWPBGqhjR8RjW5LSe9o.24q4WV.2pwAxw.nsFq7/2r.IMEJm', 1),
('Alicent Hightower', 'hight_alic79@gmail.com', '$2b$10$1tNUJrziCHz7CdXSeX.I2u6vG0wghjt7vcya6DcbSW6wDxWm4Mpgu', 1),
('Viserys Targaryen', 'targa_vise80@gmail.com', '$2b$10$676GbuBxgGQTakXlPTiI1OyE.P7WjXG1btY7c/H4wsMMRmVM9I8kO', 1),
('Jacaerys Velaryon', 'velar_jaca81@gmail.com', '$2b$10$XEMz1hYYdw7DqHP9kkU/muQcZgrGjutr2ue0w/HjXHQBFMq6khIiq', 1),
('Lucerys Velaryon', 'velar_luce82@gmail.com', '$2b$10$YF0dwdvgMmrAC5whOEhTiuEVnTl2zX59w1c7a6PIIBtQNkHaCkBhe', 1),
('Corlys Velaryon', 'velar_corl83@gmail.com', '$2b$10$VJexDSaNyS0hkuBJgokPvOd6gSeub0Ywlj2yoZl5n8r.V4fMKEGem', 1),
('Rhaenys Targaryen', 'targa_rhae84@gmail.com', '$2b$10$ptFm/vczQzJiyUbiLS1idOv4cPeGhN8lbPuu4Kj5M57san3t5GSs2', 1),
('Aemond Targaryen', 'targa_aemo85@gmail.com', '$2b$10$jVpOr5gNsccn8ZCoO9BUDedjpQOAPI05ODBBBZk7B0pu8da8RS.ni', 1),
('Helaena Targaryen', 'targa_hela86@gmail.com', '$2b$10$5PYFBE/OdLNWxJIE9z9MnuqX55rEDtThNZelh6cRbh.Gli8jIs5XK', 1),
('Carmen Berzatto', 'berza_carm87@gmail.com', '$2b$10$pZzCoE.01RQullSNvIE.buGZBUT4y6kJc5aaqK.0DRB82TFPj.ham', 1),
('Sydney Adamu', 'adamu_sydn88@gmail.com', '$2b$10$xRJr.EVfEYidz0ZZ9uWNiOQs7b9Tl4ledtYj0WM98kIvq4zRf2FVK', 1),
('Richard Jerimovich', 'jerim_rich89@gmail.com', '$2b$10$pfxVqk97apw1EkktvZGD/OlIZVh8ULkpALEfjLtv1ZMyy574FhOjy', 1),
('Natalie Berzatto', 'berza_nata90@gmail.com', '$2b$10$azPD7Nl6XvmWWaZ6objmEe1WA0hmgPGucBnDL.7t0u/E4Sf5U7niG', 1),
('Marcus Brooks', 'brook_marc91@gmail.com', '$2b$10$JmrAO.nrY.C0r9RUvvtVzeVlqpxWk5YDsggyiFMKYKy49TGSyvMqq', 1),
('Tina Marrero', 'marre_tina92@gmail.com', '$2b$10$DNoHfhYfCHz8am1rz8UYX.5p0lQ7EgS8dKOe/KS0auZP5zU7ehlEW', 1),
('Ebraheim Hassan', 'hassa_ebra93@gmail.com', '$2b$10$izjBKpjzGG00c0X38.BOWeJecVp6rk7Zcr625F/7aU1FTxby70P3q', 1),
('Neil Fak', 'fak_neil94@gmail.com', '$2b$10$YiadrD9IJ8Q2aSAXHIitd.qLIb3ml6IADfqfeEjJX8d6wzabn3Db2', 1),
('Claire Dunlap', 'dunla_clai95@gmail.com', '$2b$10$Rnxjkduzm5sFVJ7zW9RokuSULRqV3o5KbOeashu5.1mj8cgrsguqy', 1),
('Michael Berzatto', 'berza_mich96@gmail.com', '$2b$10$2t.vfJJMNFwNSVsTnoNKV..0KxklYeXVtcVJdbhBRXnsbpK1p9byy', 1),
('Barbie Roberts', 'rober_barb97@gmail.com', '$2b$10$IQxegOvqbnucj2DhDxAEqOauDo8GsnUSiw7FO.LGfLn7Z/DOAZ0ze', 1),
('Ken Carson', 'carso_ken98@gmail.com', '$2b$10$LoENZZ4ovHbMDTyCR9fL9uyN84VQRu.NbjrK.AHVfMRavaRv3EOCy', 1),
('Gloria Rivera', 'river_glor99@gmail.com', '$2b$10$6xAVfndXqZ22AfyEMcbOzeiQIdYPKRYCVKL4rs4FKWKNwYLx46sjK', 1),
('Sasha Rivera', 'river_sash100@gmail.com', '$2b$10$Q9Dud4Cy.jk/MwfeDvg4nupkSdYlj.XacLekRD1PsAYgM76cIFnL2', 1),
('Weird Barbie', 'barbi_weir101@gmail.com', '$2b$10$jYSmo6HECJ7VvaXLK0VDUe5MlvmRjqAmGqq02VTZY498ZHwPtfQ4C', 1),
('Allan Sherwood', 'sherw_alla102@gmail.com', '$2b$10$8LSOBOft3KF9zGR18aWIn.RaSBu.VUHz5phctxsZ6rFE5IBXqDN26', 1),
('President Barbie', 'barbi_pres103@gmail.com', '$2b$10$VdddEIwE6QZQIWX7zuTKp.KYut9fZFcd78jYVZbCNZfNMEkQNRwoG', 1),
('Midge Hadley', 'hadle_midg104@gmail.com', '$2b$10$/2eGAszrmWRB6FAJuCY2O.dv6phSSIAw9elFij.Y9PqcqAl/ticfK', 1),
('Ruth Handler', 'handl_ruth105@gmail.com', '$2b$10$rqV6DB1uh3RDeUpwGatUW.k/buMNk4ilZmMhTbe5o0ZeIkadb7VK.', 1),
('Skipper Roberts', 'rober_skip106@gmail.com', '$2b$10$5vhZnH5rAFt4kmyy8mlax.EsBHhSN8TzYMMSFHzHuBJ//z6KCOW06', 1),
('Lucy MacLean', 'macle_lucy107@gmail.com', '$2b$10$wisB6QpNdO5nV.Np4sl2buP6U1tV75.994cNFh96DSjWd7QBmXuHK', 1),
('Maximus Stone', 'stone_maxi108@gmail.com', '$2b$10$7AjFU.xaeHCdPlDEwiVxfOJYVe/XqLpxBjnbvsr4KWgvdhk750p7u', 1),
('Cooper Howard', 'howar_coop109@gmail.com', '$2b$10$LicIjKYU2KSBqsUNNXq7V.YLmJbtS9w0B7.9RrGNwKAa2D2zLt1py', 1),
('Norm MacLean', 'macle_norm110@gmail.com', '$2b$10$lPeiccNg8Gw1bcAu7JC5DuEekNkWMqYWbQUdBtbY6/G3Y4Y62b0rO', 1),
('Hank MacLean', 'macle_hank111@gmail.com', '$2b$10$PuiYDWDiXtQGRc3kxNSbyurkqppzRylwT4YYnrl/XIpp43EvLl5ri', 1),
('Lee Moldaver', 'molda_lee112@gmail.com', '$2b$10$h5VtPehk1ODB0gR7iU2cQ../W0Gi1ZxVL/JWIFxrrjBAXnTA.W0LG', 1),
('Thaddeus Brown', 'brown_thad113@gmail.com', '$2b$10$ucW5A2uyUP.rVs6E4zp5UORdpqb6/Fdrj0dc3qQDdxRwRJtj183aW', 1),
('Dane Murphy', 'murph_dane114@gmail.com', '$2b$10$34BV.Rf6H/q5VE/aHN3xyuROU2NBYQJ.PLjmhPBnc/C6/RQkQzOF2', 1),
('Betty Pearson', 'pears_bett115@gmail.com', '$2b$10$c4vShip9JAsFNP74DVrSmO6hPDlRcVsMR1.Ss5kLPVxplUwZcavSq', 1),
('Ma June', 'june_ma116@gmail.com', '$2b$10$G1W87sus3aqHt49ZzEvsNO4uyyZ.PF8PswlVrYpjVDBLFyZzLEw7y', 1);

INSERT INTO `admins` (`user_id`, `access_level`)
SELECT `user_id`, 10
FROM `users`
WHERE `email` IN (
    'horne_chri87@gmail.com',
    'wolff_toto00@gmail.com',
    'vowle_jame00@gmail.com',
    'brown_zak00@gmail.com',
    'barre_ashl27@gmail.com'
);

INSERT INTO `professors` (`user_id`, `department`)
SELECT `user_id`, 'Computer Science'
FROM `users`
WHERE `email` IN (
    'butch_bill17@gmail.com',
    'campb_hugh18@gmail.com'
);

INSERT INTO `professors` (`user_id`, `department`)
SELECT `user_id`, 'Mathematics'
FROM `users`
WHERE `email` IN (
    'campb_cind32@gmail.com',
    'meeks_bren33@gmail.com'
);

INSERT INTO `professors` (`user_id`, `department`)
SELECT `user_id`, 'English'
FROM `users`
WHERE `email` IN (
    'wheel_nanc48@gmail.com',
    'byers_jona49@gmail.com'
);

INSERT INTO `professors` (`user_id`, `department`)
SELECT `user_id`, 'History'
FROM `users`
WHERE `email` IN (
    'byers_joyc53@gmail.com',
    'bauma_murr55@gmail.com'
);

INSERT INTO `professors` (`user_id`, `department`)
SELECT `user_id`, 'Physics'
FROM `users`
WHERE `email` IN (
    'mille_joel67@gmail.com',
    'mille_tomm69@gmail.com'
);

INSERT INTO `professors` (`user_id`, `department`)
SELECT `user_id`, 'Chemistry'
FROM `users`
WHERE `email` IN (
    'ander_abby75@gmail.com',
    'alvar_dina76@gmail.com'
);

INSERT INTO `professors` (`user_id`, `department`)
SELECT `user_id`, 'Nursing'
FROM `users`
WHERE `email` IN (
    'dunla_clai95@gmail.com',
    'river_glor99@gmail.com'
);

INSERT INTO `professors` (`user_id`, `department`)
SELECT `user_id`, 'Information Systems Management'
FROM `users`
WHERE `email` IN (
    'adamu_sydn88@gmail.com',
    'jerim_rich89@gmail.com'
);

INSERT INTO `students` (`user_id`, `major`)
SELECT `user_id`, 'Computer Science'
FROM `users`
WHERE `email` IN (
    'perez_serg11@gmail.com',
    'strol_lanc18@gmail.com',
    'hulke_nico27@gmail.com',
    'rosbe_nico6@gmail.com',
    'prost_alai1@gmail.com',
    'bearm_oliv87@gmail.com',
    'miyas_kimi22@gmail.com',
    'butch_ryan31@gmail.com',
    'hartm_dwig41@gmail.com',
    'buckl_robi51@gmail.com',
    'galpi_tyle61@gmail.com',
    'servo_tess71@gmail.com',
    'velar_jaca81@gmail.com',
    'brook_marc91@gmail.com',
    'barbi_weir101@gmail.com',
    'howar_coop109@gmail.com'
);

INSERT INTO `students` (`user_id`, `major`)
SELECT `user_id`, 'Mathematics'
FROM `users`
WHERE `email` IN (
    'norri_land4@gmail.com',
    'botta_valt77@gmail.com',
    'raikk_kimi7@gmail.com',
    'grosj_roma8@gmail.com',
    'ville_jacq27@gmail.com',
    'janua_anni19@gmail.com',
    'frank_regg28@gmail.com',
    'phill_greg38@gmail.com',
    'mayfi_max46@gmail.com',
    'sincl_enid58@gmail.com',
    'weems_lari66@gmail.com',
    'targa_daem78@gmail.com',
    'targa_hela86@gmail.com',
    'rober_barb97@gmail.com',
    'rober_skip106@gmail.com',
    'murph_dane114@gmail.com'
);

INSERT INTO `students` (`user_id`, `major`)
SELECT `user_id`, 'English'
FROM `users`
WHERE `email` IN (
    'russe_geor63@gmail.com',
    'ocon_este31@gmail.com',
    'sarge_loga2@gmail.com',
    'barri_rube11@gmail.com',
    'berge_gerh28@gmail.com',
    'pourd_theo5@gmail.com',
    'milk_marv24@gmail.com',
    'wilki_ray35@gmail.com',
    'wheel_mike43@gmail.com',
    'munso_eddi54@gmail.com',
    'addam_mort63@gmail.com',
    'frank_bill73@gmail.com',
    'velar_corl83@gmail.com',
    'hassa_ebra93@gmail.com',
    'barbi_pres103@gmail.com',
    'macle_hank111@gmail.com'
);

INSERT INTO `students` (`user_id`, `major`)
SELECT `user_id`, 'History'
FROM `users`
WHERE `email` IN (
    'verst_max1@gmail.com',
    'alons_fern14@gmail.com',
    'magnu_kevi20@gmail.com',
    'butto_jens22@gmail.com',
    'senna_ayrt12@gmail.com',
    'anton_kimi12@gmail.com',
    'maeve_magg21@gmail.com',
    'mosko_kevi30@gmail.com',
    'hails_gail40@gmail.com',
    'harri_stev50@gmail.com',
    'thorp_xavi60@gmail.com',
    'mille_sara70@gmail.com',
    'targa_vise80@gmail.com',
    'berza_nata90@gmail.com',
    'river_sash100@gmail.com',
    'stone_maxi108@gmail.com',
    'june_ma116@gmail.com'
);

INSERT INTO `students` (`user_id`, `major`)
SELECT `user_id`, 'Physics'
FROM `users`
WHERE `email` IN (
    'sainz_carl55@gmail.com',
    'ricci_dani3@gmail.com',
    'lawso_liam40@gmail.com',
    'schum_mick47@gmail.com',
    'hakki_mika8@gmail.com',
    'kubic_robe88@gmail.com',
    'neuma_vict26@gmail.com',
    'gilmo_buff37@gmail.com',
    'sincl_luca45@gmail.com',
    'addam_wedn57@gmail.com',
    'addam_pugs65@gmail.com',
    'targa_rhae77@gmail.com',
    'targa_aemo85@gmail.com',
    'berza_mich96@gmail.com',
    'handl_ruth105@gmail.com',
    'brown_thad113@gmail.com'
);

INSERT INTO `students` (`user_id`, `major`)
SELECT `user_id`, 'Chemistry'
FROM `users`
WHERE `email` IN (
    'hamil_lewi44@gmail.com',
    'gasly_pierr10@gmail.com',
    'albon_alex23@gmail.com',
    'massa_feli19@gmail.com',
    'lauda_niki12@gmail.com',
    'dooha_jack7@gmail.com',
    'frenc_serg23@gmail.com',
    'meeks_shor34@gmail.com',
    'hoppe_jane42@gmail.com',
    'hoppe_jim52@gmail.com',
    'oting_euge62@gmail.com',
    'stone_marl72@gmail.com',
    'velar_luce82@gmail.com',
    'marre_tina92@gmail.com',
    'sherw_alla102@gmail.com',
    'macle_norm110@gmail.com'
);

INSERT INTO `students` (`user_id`, `major`)
SELECT `user_id`, 'Nursing'
FROM `users`
WHERE `email` IN (
    'piast_osca81@gmail.com',
    'zhou_guan24@gmail.com',
    'vette_seba5@gmail.com',
    'maldo_past18@gmail.com',
    'monto_juan42@gmail.com',
    'homel_john20@gmail.com',
    'noir_earv29@gmail.com',
    'gilmo_doof39@gmail.com',
    'byers_will47@gmail.com',
    'barcl_bian59@gmail.com',
    'willi_elli68@gmail.com',
    'hight_alic79@gmail.com',
    'berza_carm87@gmail.com',
    'carso_ken98@gmail.com',
    'macle_lucy107@gmail.com',
    'pears_bett115@gmail.com'
);

INSERT INTO `students` (`user_id`, `major`)
SELECT `user_id`, 'Information Systems Management'
FROM `users`
WHERE `email` IN (
    'lecle_char16@gmail.com',
    'tsuno_yuki22@gmail.com',
    'devri_nyck21@gmail.com',
    'schum_mich47@gmail.com',
    'coult_davi2@gmail.com',
    'ilott_call12@gmail.com',
    'soldi_ben25@gmail.com',
    'prinz_bobb36@gmail.com',
    'hende_dust44@gmail.com',
    'sincl_eric56@gmail.com',
    'addam_gome64@gmail.com',
    'frank_fran74@gmail.com',
    'targa_rhae84@gmail.com',
    'fak_neil94@gmail.com',
    'hadle_midg104@gmail.com',
    'molda_lee112@gmail.com'
);

INSERT INTO `courses` (`course_code`, `title`, `description`, `credits`) VALUES
('CHEM103', 'General Chemistry I', 'Introductory general chemistry course focused on matter, chemical calculations, and foundational laboratory science concepts.', 4),
('CHEM113', 'General Chemistry II', 'Continuation of general chemistry covering kinetics, equilibria, electrochemistry, and chemistry of the elements.', 4),
('CHEM121', 'Chemistry in the Modern World', 'Survey of chemistry for non-science majors with emphasis on health, safety, the environment, and everyday decision-making.', 3),
('CHEM297', 'Environmental Chemistry', 'Applied chemistry course focused on chemical processes in natural systems and environmental impacts on air, water, and soil.', 3),
('CMSC100', 'Social Networking and Cybersecurity Best Practices', 'Hands-on introduction to social networking tools and personal cybersecurity practices for safe online collaboration.', 3),
('CMSC105', 'Introduction to Problem-Solving and Algorithm Design', 'Applied introduction to algorithmic thinking and programming problem solving using core programming constructs.', 3),
('CMSC115', 'Fundamentals of Programming and Software Development', 'Foundation course in programming and software development with emphasis on coding, debugging, and documentation.', 3),
('CMSC150', 'Introduction to Discrete Structures', 'Introduction to logic, sets, functions, relations, graphs, trees, and proof techniques used in computer science.', 3),
('CMSC215', 'Object Oriented Programming', 'Study of object-oriented software development using classes, inheritance, interfaces, and exception handling.', 3),
('CMSC220', 'Intermediate Programming', 'Intermediate programming course that strengthens software construction, testing, and object-oriented design skills.', 3),
('CMSC310', 'Computer Systems and Architecture', 'Study of computer architecture, data representation, assembly language, memory, and processor organization.', 3),
('CMSC315', 'Data Structures and Analysis', 'Project-driven study of lists, stacks, queues, trees, graphs, recursion, sorting, and algorithm analysis.', 3),
('CMSC320', 'Relational Database Concepts and Applications', 'Study of relational database design, normalization, SQL, and database implementation concepts.', 3),
('CMSC325', 'Game Design and Development', 'Project-based introduction to modern game design and development concepts, tools, and production workflows.', 3),
('CMSC330', 'Advanced Programming Languages', 'Comparative study of programming language design, syntax, semantics, and runtime behavior.', 3),
('CMSC335', 'Object-Oriented and Concurrent Programming', 'Applied study of modern Java programming with emphasis on concurrency, streams, and scalable software construction.', 3),
('CMSC340', 'Web Programming', 'Course on modern web application development covering HTTP, HTML, CSS, JavaScript, server-side design, and security.', 3),
('CMSC345', 'Software Engineering Principles and Techniques', 'Introduction to software engineering processes, planning, teamwork, quality, and development lifecycle practices.', 3),
('CMSC405', 'Computer Graphics', 'Hands-on introduction to computer graphics with 2D and 3D rendering, animation, and OpenGL-based programming.', 3),
('CMSC412', 'Operating Systems', 'Study of operating system fundamentals including processes, resources, memory management, and system design.', 3),
('CMSC415', 'Distributed Database Systems', 'Examination of distributed database architecture, distributed design, and related big data and NoSQL concepts.', 3),
('CMSC420', 'Advanced Relational Database Concepts and Applications', 'Advanced database course covering enterprise SQL, procedures, triggers, warehousing, and administration concepts.', 3),
('CMSC425', 'Mobile App Development', 'Study of Android mobile application design and development with emphasis on architecture, interfaces, and privacy.', 3),
('CMSC427', 'Artificial Intelligence Foundations', 'Introduction to artificial intelligence theory and practice, including search, knowledge representation, logic, and learning.', 3),
('CMSC430', 'Compiler Theory and Design', 'Study of language translation, parsing, grammars, and code generation in compiler construction.', 3),
('CMSC440', 'Advanced Programming in Java', 'Advanced full-stack and enterprise-style Java programming with emphasis on maintainable, secure web applications.', 3),
('CMSC451', 'Design and Analysis of Computer Algorithms', 'Study of algorithm design strategies, correctness, and asymptotic analysis for complex computational problems.', 3),
('CMSC465', 'Image and Signal Processing', 'Project-driven study of signal analysis, filtering, Fourier methods, image transformation, and classification.', 3),
('CMSC486A', 'Workplace Learning in Computer Science', 'Supervised workplace learning course integrating computer science study with guided professional experience.', 3),
('CMSC486B', 'Workplace Learning in Computer Science', 'Extended supervised workplace learning course integrating computer science study with guided professional experience.', 6),
('CMSC495', 'Computer Science Capstone', 'Capstone course focused on planning, building, testing, and documenting collaborative computer science projects.', 3),
('CMSC498', 'Special Topics in Computer Science', 'Seminar course covering selected advanced or emerging topics in computer science.', 3),
('ENGL102', 'Composition and Literature', 'Writing-intensive literature course focused on analysis, academic writing, and interpretation of literary texts.', 3),
('ENGL103', 'Introduction to Mythology', 'Survey of classical mythology and its continuing influence on literature, culture, and modern society.', 3),
('ENGL240', 'Introduction to Fiction, Poetry, and Drama', 'Introduction to literary genres with emphasis on close reading, interpretation, and analytical writing.', 3),
('ENGL250', 'Introduction to Women''s Literature', 'Survey of literature by and about women across cultures and historical periods.', 3),
('ENGL281', 'Standard English Grammar', 'Advanced study of standard edited English focused on grammar, clarity, and effective prose.', 3),
('ENGL294', 'Introduction to Creative Writing', 'Introductory creative writing course focused on drafting, revision, critique, and literary craft.', 3),
('ENGL303', 'Critical Approaches to Literature', 'Foundation course in literary criticism, close reading, and analytical writing.', 3),
('ENGL310', 'Renaissance Literature', 'Study of major British authors and texts from the English Renaissance.', 3),
('ENGL311', 'The Long 18th-Century British Literature', 'Study of major British authors and literary works from the Restoration through the Age of Sensibility.', 3),
('ENGL312', '19th-Century British Literature', 'Study of major British authors and works from the Romantic and Victorian periods.', 3),
('ENGL363', 'African American Authors from the Colonial Era to 1900', 'Study of African American authors before 1900 in literary and historical context.', 3),
('ENGL364', 'African American Authors from 1900 to Present', 'Study of modern and contemporary African American authors in historical and literary context.', 3),
('ENGL381', 'Special Topics in Creative Writing', 'Creative writing workshop course exploring selected genres, forms, and special writing topics.', 3),
('ENGL384', 'Advanced Grammar and Style', 'Advanced writing course focused on grammar, style, editing, rhetorical control, and polished prose.', 3),
('ENGL386', 'History of the English Language', 'Study of the development, structure, and continuing evolution of the English language.', 3),
('ENGL389', 'Writing Workshop', 'Workshop-based writing course centered on drafting, peer review, revision, and portfolio development.', 3),
('ENGL406', 'Shakespeare Studies', 'Intensive study of Shakespeare''s works in literary, historical, and cultural context.', 3),
('ENGL418', 'Major British Writers Before 1800', 'Focused study of major British writers before 1800 using historical and critical perspectives.', 3),
('ENGL430', 'Early American Literature', 'Survey of early American literature across key periods, movements, and historical developments.', 3),
('ENGL433', 'Modern American Literature', 'Study of modern American literature with emphasis on modernism, context, and critical interpretation.', 3),
('ENGL439', 'Major American Writers', 'Focused study of selected American writers and the historical and cultural influences on their work.', 3),
('ENGL441', 'Postmodern American Literature: 1945 to 1999', 'Study of post-1945 American literature through major themes, movements, and cultural change.', 3),
('ENGL459', 'Contemporary Global Literatures', 'Advanced study of contemporary global literature with attention to region, history, and social justice.', 3),
('ENGL495', 'English Literature Capstone', 'Capstone course integrating literary study, portfolio development, research, and advanced writing.', 3),
('HIST115', 'World History I', 'Survey of world history from prehistory to around 1500 with emphasis on civilizations and global development.', 3),
('HIST116', 'World History II', 'Survey of world history from around 1500 to the present with emphasis on global systems and transformations.', 3),
('HIST125', 'Technological Transformations', 'History course examining the reciprocal relationship between technology, society, and historical change.', 3),
('HIST141', 'Western Civilization I', 'Survey of Western civilization from antiquity through the Reformation.', 3),
('HIST142', 'Western Civilization II', 'Survey of Western civilization from the Reformation to the modern period.', 3),
('HIST156', 'History of the United States to 1865', 'Survey of United States history from colonization through the Civil War era.', 3),
('HIST157', 'History of the United States from 1865', 'Survey of United States history from Reconstruction to the present.', 3),
('HIST202', 'Principles of War', 'Study of classic principles of war and their influence on military and national security practice.', 3),
('HIST289', 'Historical Methods', 'Introduction to historical methods, approaches, ethics, and professional practice in the discipline.', 3),
('HIST309', 'Historical Writing', 'Advanced history course focused on research design, source evaluation, and historical writing.', 3),
('HIST316L', 'The American West', 'Study of the exploration, settlement, development, and mythology of the American West.', 3),
('HIST326', 'Ancient Rome', 'Study of ancient Rome and the development of Roman institutions, politics, and society.', 3),
('HIST337', 'Europe and the World', 'Analysis of Europe''s interaction with the wider world through empire, culture, and global change.', 3),
('HIST365', 'Modern America', 'Survey of modern United States history from the New Deal through the turn of the 21st century.', 3),
('HIST377', 'U.S. Women''s History: 1870 to 2000', 'Examination of the experiences of women in the United States from 1870 to 2000.', 3),
('HIST381', 'America in Vietnam', 'Historical examination of U.S. involvement in Vietnam and its political, military, and cultural legacy.', 3),
('HIST392', 'History of the Contemporary Middle East', 'Survey of the modern Middle East with emphasis on politics, nationalism, conflict, and global relations.', 3),
('HIST461', 'African American History: 1865 to the Present', 'Study of African American history from emancipation through the modern era.', 3),
('HIST462', 'The U.S. Civil War', 'In-depth examination of the origins, conduct, and consequences of the American Civil War.', 3),
('HIST464', 'World War I', 'Intensive study of the origins, conduct, and impact of the First World War.', 3),
('HIST465', 'World War II', 'Study of the causes, global conflict, and consequences of the Second World War.', 3),
('HIST480', 'History of China to 1912', 'Survey of Chinese history from early civilization through the end of the Qing dynasty.', 3),
('HIST482', 'History of Japan to 1800', 'Survey of Japanese history from its origins through the late Edo period.', 3),
('HIST483', 'History of Japan Since 1800', 'Survey of Japanese history from the modern era to the present.', 3),
('HIST486A', 'Workplace Learning in History', 'Supervised workplace learning course integrating history study with guided professional experience.', 3),
('HIST486B', 'Workplace Learning in History', 'Extended supervised workplace learning course integrating history study with guided professional experience.', 6),
('HIST495', 'History Capstone', 'Capstone research course focused on producing a substantial original historical project.', 3),
('IFSM201', 'Concepts and Applications of Information Technology', 'Introduction to information technology, data, software, hardware, networks, and responsible technology use.', 3),
('IFSM300', 'Information Systems in Organizations', 'Overview of how information systems support organizational goals, processes, and strategy.', 3),
('IFSM301', 'Foundations of Management Information Systems', 'Introduction to IT management, governance, strategic alignment, and decision-making in organizations.', 3),
('IFSM304', 'Ethics in Information Technology', 'Study of ethical decision-making and responsible practice in the use of information technology.', 3),
('IFSM305', 'Information Systems in Healthcare Organizations', 'Examination of how information systems support healthcare strategy, safety, quality, and operations.', 3),
('IFSM310', 'Software and Hardware Infrastructure Concepts', 'Study of computing infrastructure components and integrated systems that support business requirements.', 3),
('IFSM311', 'Enterprise Architecture', 'Study of enterprise architecture frameworks and the alignment of systems with organizational change.', 3),
('IFSM370', 'Telecommunications in Information Systems', 'Introduction to telecommunications, networking, and secure infrastructure planning for business systems.', 3),
('IFSM380', 'Managing and Leading in Information Technology', 'Leadership and management course for information technology professionals in fast-paced workplaces.', 3),
('IFSM432', 'Business Continuity Planning', 'Study of business continuity and disaster recovery planning for mission-critical information systems.', 3),
('IFSM438', 'Information Systems Project Management', 'Applied project management course focused on planning, control, and delivery of IT projects.', 3),
('IFSM441', 'Agile Project Management', 'Advanced study of agile project management methods for software and technology initiatives.', 3),
('IFSM461', 'Systems Analysis and Design', 'Project-driven course on translating business requirements into effective operational systems.', 3),
('IFSM486A', 'Workplace Learning in Management Information Systems', 'Supervised workplace learning course integrating management information systems study with professional experience.', 3),
('IFSM486B', 'Workplace Learning in Management Information Systems', 'Extended supervised workplace learning course integrating management information systems study with professional experience.', 6),
('IFSM495', 'Management Information Systems Capstone', 'Capstone course integrating analysis, planning, design, and problem solving in management information systems.', 3),
('MATH105', 'Topics for Mathematical Literacy', 'Mathematics course covering quantitative reasoning, modeling, finance, probability, and statistical thinking.', 3),
('MATH107', 'College Algebra', 'Study of equations, inequalities, functions, graphing, and mathematical modeling in algebra.', 3),
('MATH108', 'Trigonometry and Analytical Geometry', 'Continuation course in trigonometry, analytic geometry, vectors, sequences, and conic sections.', 3),
('MATH115', 'Pre-Calculus', 'Pre-calculus course emphasizing equations, functions, graphs, and mathematical modeling.', 3),
('MATH140', 'Calculus I', 'Introduction to differential and integral calculus with applications.', 4),
('MATH141', 'Calculus II', 'Continuation of calculus covering advanced integration techniques, sequences, and series.', 4),
('MATH241', 'Calculus III', 'Multivariable calculus course covering vectors, partial derivatives, and multiple integration.', 4),
('MATH246', 'Differential Equations', 'Introduction to ordinary differential equations and mathematical models for physical systems.', 3),
('MATH301', 'Concepts of Real Analysis I', 'Upper-level mathematics course focused on formal proof and real analysis concepts.', 3),
('MATH340', 'Linear Algebra', 'Study of vector spaces, matrices, linear transformations, eigenvalues, and applications.', 4),
('MATH402', 'Algebraic Structures', 'Upper-level abstract algebra course covering groups, rings, fields, and proof techniques.', 3),
('MATH463', 'Complex Analysis', 'Study of complex variables, mappings, integrals, series, and applications.', 3),
('NURS302', 'Transition to Professional Nursing Practice', 'Transition course for registered nurses focused on professional identity, inquiry, communication, and patient safety.', 3),
('NURS322', 'Health Assessment and Wellness Promotion', 'Nursing health assessment course focused on holistic assessment, wellness promotion, and chronic disease management.', 4),
('NURS352', 'Introduction to Nursing Scholarship', 'Study of research methods and scholarly inquiry to support evidence-based nursing practice.', 3),
('NURS372', 'Introduction to Healthcare Informatics Technology in Nursing', 'Nursing informatics course focused on communication technologies, documentation, and ethical use of health information systems.', 3),
('NURS392', 'Policy, Politics, and Economics in Healthcare', 'Study of healthcare policy, politics, economics, advocacy, and equity in nursing practice.', 3),
('NURS412', 'Population, Global, and Community Health Issues', 'Study of community, public, and global health nursing with emphasis on population-focused care.', 3),
('NURS432', 'Leadership in Personal and Professional Nursing Practice', 'Leadership course focused on communication, collaboration, management, and evidence-based nursing leadership.', 3),
('NURS452', 'Complex Healthcare Systems: Quality Improvement and Patient Safety', 'Study of quality improvement, patient safety, systems thinking, and evidence-based solutions in complex healthcare settings.', 3),
('NURS462', 'Nursing Care of the Family and Community', 'Community and family nursing course focused on population health, prevention, and care coordination across settings.', 4),
('NURS472', 'Nursing Practice Experience', 'Practice experience course synthesizing nursing theory, scholarship, leadership, and applied nursing skills.', 2),
('NURS496', 'Nursing Capstone', 'Writing-intensive capstone course focused on evidence-based nursing practice and quality improvement project design.', 3),
('PHYS121', 'Fundamentals of Physics I', 'Introductory physics course covering mechanics, motion, force, and energy.', 4),
('PHYS122', 'Fundamentals of Physics II', 'Continuation of introductory physics covering electricity, magnetism, waves, and related concepts.', 4);

INSERT INTO `semesters` (`term`, `year`) VALUES
('Spring', 2024),
('Summer', 2024),
('Fall', 2024),
('Spring', 2025),
('Summer', 2025),
('Fall', 2025),
('Spring', 2026),
('Fall', 2026);

INSERT INTO `prerequisites`
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CHEM103' AND c.course_code = 'CHEM113'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CHEM113' AND c.course_code = 'CHEM297'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC105' AND c.course_code = 'CMSC115'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC115' AND c.course_code = 'CMSC215'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC115' AND c.course_code = 'CMSC220'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC115' AND c.course_code = 'CMSC310'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC215' AND c.course_code = 'CMSC315'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC115' AND c.course_code = 'CMSC320'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC215' AND c.course_code = 'CMSC325'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC315' AND c.course_code = 'CMSC330'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC315' AND c.course_code = 'CMSC335'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC115' AND c.course_code = 'CMSC340'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC115' AND c.course_code = 'CMSC345'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC315' AND c.course_code = 'CMSC405'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC310' AND c.course_code = 'CMSC412'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC315' AND c.course_code = 'CMSC412'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC320' AND c.course_code = 'CMSC415'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC320' AND c.course_code = 'CMSC420'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC215' AND c.course_code = 'CMSC425'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC315' AND c.course_code = 'CMSC427'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC330' AND c.course_code = 'CMSC430'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC220' AND c.course_code = 'CMSC440'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC340' AND c.course_code = 'CMSC440'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC150' AND c.course_code = 'CMSC451'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC315' AND c.course_code = 'CMSC451'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'MATH141' AND c.course_code = 'CMSC465'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC315' AND c.course_code = 'CMSC465'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC330' AND c.course_code = 'CMSC495'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC335' AND c.course_code = 'CMSC495'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC345' AND c.course_code = 'CMSC495'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL240'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL250'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL281'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL303'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL363'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL364'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL381'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL384'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL386'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL389'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL406'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL418'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL430'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL433'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL439'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL441'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL459'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL250' AND c.course_code = 'ENGL495'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL303' AND c.course_code = 'ENGL495'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'HIST115' AND c.course_code = 'HIST289'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'HIST289' AND c.course_code = 'HIST309'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'HIST289' AND c.course_code = 'HIST495'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'IFSM300' AND c.course_code = 'IFSM301'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'IFSM300' AND c.course_code = 'IFSM370'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'IFSM201' AND c.course_code = 'IFSM380'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'IFSM311' AND c.course_code = 'IFSM432'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'IFSM300' AND c.course_code = 'IFSM438'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'IFSM438' AND c.course_code = 'IFSM441'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'IFSM311' AND c.course_code = 'IFSM461'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'IFSM438' AND c.course_code = 'IFSM495'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'IFSM461' AND c.course_code = 'IFSM495'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'MATH107' AND c.course_code = 'MATH108'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'MATH115' AND c.course_code = 'MATH140'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'MATH140' AND c.course_code = 'MATH141'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'MATH140' AND c.course_code = 'MATH340'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'MATH141' AND c.course_code = 'MATH241'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'MATH141' AND c.course_code = 'MATH246'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'MATH141' AND c.course_code = 'MATH301'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'MATH141' AND c.course_code = 'MATH402'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'MATH141' AND c.course_code = 'MATH463'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'NURS302' AND c.course_code = 'NURS352'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'NURS302' AND c.course_code = 'NURS372'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'NURS302' AND c.course_code = 'NURS392'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'NURS302' AND c.course_code = 'NURS412'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'NURS302' AND c.course_code = 'NURS432'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'NURS302' AND c.course_code = 'NURS452'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'NURS302' AND c.course_code = 'NURS462'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'NURS352' AND c.course_code = 'NURS496';

CREATE TEMPORARY TABLE `seed_sections` (
  `seed_id` INT NOT NULL AUTO_INCREMENT,
  `course_code` VARCHAR(10) NOT NULL,
  `term` VARCHAR(8) NOT NULL,
  `year` INT NOT NULL,
  `professor_email` VARCHAR(100) NOT NULL,
  `capacity` INT NOT NULL,
  `days` VARCHAR(10) NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  PRIMARY KEY (`seed_id`)
);

INSERT INTO `seed_sections` (`course_code`, `term`, `year`, `professor_email`, `capacity`, `days`, `start_time`, `end_time`) VALUES
('CMSC105', 'Spring', 2024, 'butch_bill17@gmail.com', 32, 'MW', '09:00:00', '10:15:00'),
('CMSC115', 'Summer', 2024, 'campb_hugh18@gmail.com', 32, 'MW', '09:00:00', '10:15:00'),
('CMSC150', 'Fall', 2024, 'butch_bill17@gmail.com', 32, 'MW', '09:00:00', '10:15:00'),
('CMSC215', 'Spring', 2025, 'campb_hugh18@gmail.com', 32, 'MW', '09:00:00', '10:15:00'),
('CMSC220', 'Summer', 2025, 'butch_bill17@gmail.com', 32, 'MW', '09:00:00', '10:15:00'),
('CMSC310', 'Fall', 2025, 'campb_hugh18@gmail.com', 32, 'MW', '09:00:00', '10:15:00'),
('CMSC315', 'Spring', 2026, 'butch_bill17@gmail.com', 32, 'MW', '09:00:00', '10:15:00'),
('CMSC320', 'Fall', 2026, 'campb_hugh18@gmail.com', 32, 'MW', '09:00:00', '10:15:00'),
('MATH105', 'Spring', 2024, 'campb_cind32@gmail.com', 32, 'TR', '09:00:00', '10:15:00'),
('MATH107', 'Summer', 2024, 'meeks_bren33@gmail.com', 32, 'TR', '09:00:00', '10:15:00'),
('MATH108', 'Fall', 2024, 'campb_cind32@gmail.com', 32, 'TR', '09:00:00', '10:15:00'),
('MATH115', 'Spring', 2025, 'meeks_bren33@gmail.com', 32, 'TR', '09:00:00', '10:15:00'),
('MATH140', 'Summer', 2025, 'campb_cind32@gmail.com', 32, 'TR', '09:00:00', '10:15:00'),
('MATH141', 'Fall', 2025, 'meeks_bren33@gmail.com', 32, 'TR', '09:00:00', '10:15:00'),
('MATH241', 'Spring', 2026, 'campb_cind32@gmail.com', 32, 'TR', '09:00:00', '10:15:00'),
('MATH340', 'Fall', 2026, 'meeks_bren33@gmail.com', 32, 'TR', '09:00:00', '10:15:00'),
('ENGL102', 'Spring', 2024, 'wheel_nanc48@gmail.com', 32, 'MW', '10:30:00', '11:45:00'),
('ENGL103', 'Summer', 2024, 'byers_jona49@gmail.com', 32, 'MW', '10:30:00', '11:45:00'),
('ENGL240', 'Fall', 2024, 'wheel_nanc48@gmail.com', 32, 'MW', '10:30:00', '11:45:00'),
('ENGL281', 'Spring', 2025, 'byers_jona49@gmail.com', 32, 'MW', '10:30:00', '11:45:00'),
('ENGL303', 'Summer', 2025, 'wheel_nanc48@gmail.com', 32, 'MW', '10:30:00', '11:45:00'),
('ENGL384', 'Fall', 2025, 'byers_jona49@gmail.com', 32, 'MW', '10:30:00', '11:45:00'),
('ENGL406', 'Spring', 2026, 'wheel_nanc48@gmail.com', 32, 'MW', '10:30:00', '11:45:00'),
('ENGL495', 'Fall', 2026, 'byers_jona49@gmail.com', 32, 'MW', '10:30:00', '11:45:00'),
('HIST115', 'Spring', 2024, 'byers_joyc53@gmail.com', 32, 'TR', '10:30:00', '11:45:00'),
('HIST116', 'Summer', 2024, 'bauma_murr55@gmail.com', 32, 'TR', '10:30:00', '11:45:00'),
('HIST125', 'Fall', 2024, 'byers_joyc53@gmail.com', 32, 'TR', '10:30:00', '11:45:00'),
('HIST141', 'Spring', 2025, 'bauma_murr55@gmail.com', 32, 'TR', '10:30:00', '11:45:00'),
('HIST142', 'Summer', 2025, 'byers_joyc53@gmail.com', 32, 'TR', '10:30:00', '11:45:00'),
('HIST289', 'Fall', 2025, 'bauma_murr55@gmail.com', 32, 'TR', '10:30:00', '11:45:00'),
('HIST309', 'Spring', 2026, 'byers_joyc53@gmail.com', 32, 'TR', '10:30:00', '11:45:00'),
('HIST495', 'Fall', 2026, 'bauma_murr55@gmail.com', 32, 'TR', '10:30:00', '11:45:00'),
('PHYS121', 'Spring', 2024, 'mille_joel67@gmail.com', 32, 'MW', '12:00:00', '13:15:00'),
('PHYS122', 'Summer', 2024, 'mille_tomm69@gmail.com', 32, 'MW', '12:00:00', '13:15:00'),
('MATH140', 'Fall', 2024, 'mille_joel67@gmail.com', 32, 'MW', '12:00:00', '13:15:00'),
('MATH141', 'Spring', 2025, 'mille_tomm69@gmail.com', 32, 'MW', '12:00:00', '13:15:00'),
('MATH241', 'Summer', 2025, 'mille_joel67@gmail.com', 32, 'MW', '12:00:00', '13:15:00'),
('CMSC100', 'Fall', 2025, 'mille_tomm69@gmail.com', 32, 'MW', '12:00:00', '13:15:00'),
('CMSC105', 'Spring', 2026, 'mille_joel67@gmail.com', 32, 'MW', '12:00:00', '13:15:00'),
('CMSC427', 'Fall', 2026, 'mille_tomm69@gmail.com', 32, 'MW', '12:00:00', '13:15:00'),
('CHEM103', 'Spring', 2024, 'ander_abby75@gmail.com', 32, 'TR', '12:00:00', '13:15:00'),
('CHEM113', 'Summer', 2024, 'alvar_dina76@gmail.com', 32, 'TR', '12:00:00', '13:15:00'),
('CHEM121', 'Fall', 2024, 'ander_abby75@gmail.com', 32, 'TR', '12:00:00', '13:15:00'),
('CHEM297', 'Spring', 2025, 'alvar_dina76@gmail.com', 32, 'TR', '12:00:00', '13:15:00'),
('MATH107', 'Summer', 2025, 'ander_abby75@gmail.com', 32, 'TR', '12:00:00', '13:15:00'),
('MATH140', 'Fall', 2025, 'alvar_dina76@gmail.com', 32, 'TR', '12:00:00', '13:15:00'),
('PHYS121', 'Spring', 2026, 'ander_abby75@gmail.com', 32, 'TR', '12:00:00', '13:15:00'),
('PHYS122', 'Fall', 2026, 'alvar_dina76@gmail.com', 32, 'TR', '12:00:00', '13:15:00'),
('NURS302', 'Spring', 2024, 'dunla_clai95@gmail.com', 32, 'MW', '13:30:00', '14:45:00'),
('NURS322', 'Summer', 2024, 'river_glor99@gmail.com', 32, 'MW', '13:30:00', '14:45:00'),
('NURS352', 'Fall', 2024, 'dunla_clai95@gmail.com', 32, 'MW', '13:30:00', '14:45:00'),
('NURS372', 'Spring', 2025, 'river_glor99@gmail.com', 32, 'MW', '13:30:00', '14:45:00'),
('NURS392', 'Summer', 2025, 'dunla_clai95@gmail.com', 32, 'MW', '13:30:00', '14:45:00'),
('NURS412', 'Fall', 2025, 'river_glor99@gmail.com', 32, 'MW', '13:30:00', '14:45:00'),
('NURS432', 'Spring', 2026, 'dunla_clai95@gmail.com', 32, 'MW', '13:30:00', '14:45:00'),
('NURS496', 'Fall', 2026, 'river_glor99@gmail.com', 32, 'MW', '13:30:00', '14:45:00'),
('IFSM201', 'Spring', 2024, 'adamu_sydn88@gmail.com', 32, 'TR', '13:30:00', '14:45:00'),
('IFSM300', 'Summer', 2024, 'jerim_rich89@gmail.com', 32, 'TR', '13:30:00', '14:45:00'),
('IFSM301', 'Fall', 2024, 'adamu_sydn88@gmail.com', 32, 'TR', '13:30:00', '14:45:00'),
('IFSM304', 'Spring', 2025, 'jerim_rich89@gmail.com', 32, 'TR', '13:30:00', '14:45:00'),
('IFSM310', 'Summer', 2025, 'adamu_sydn88@gmail.com', 32, 'TR', '13:30:00', '14:45:00'),
('IFSM370', 'Fall', 2025, 'jerim_rich89@gmail.com', 32, 'TR', '13:30:00', '14:45:00'),
('IFSM438', 'Spring', 2026, 'adamu_sydn88@gmail.com', 32, 'TR', '13:30:00', '14:45:00'),
('IFSM495', 'Fall', 2026, 'jerim_rich89@gmail.com', 32, 'TR', '13:30:00', '14:45:00'),
('CMSC340', 'Fall', 2026, 'butch_bill17@gmail.com', 22, 'MW', '09:00:00', '10:15:00'),
('CMSC345', 'Fall', 2026, 'campb_hugh18@gmail.com', 22, 'MW', '09:00:00', '10:15:00'),
('CMSC427', 'Fall', 2026, 'butch_bill17@gmail.com', 20, 'TR', '10:30:00', '11:45:00'),
('CMSC495', 'Fall', 2026, 'campb_hugh18@gmail.com', 18, 'TR', '10:30:00', '11:45:00'),
('MATH140', 'Fall', 2026, 'campb_cind32@gmail.com', 24, 'MW', '09:00:00', '10:15:00'),
('MATH141', 'Fall', 2026, 'meeks_bren33@gmail.com', 24, 'MW', '09:00:00', '10:15:00'),
('MATH246', 'Fall', 2026, 'campb_cind32@gmail.com', 20, 'TR', '12:00:00', '13:15:00'),
('ENGL240', 'Fall', 2026, 'wheel_nanc48@gmail.com', 20, 'TR', '10:30:00', '11:45:00'),
('ENGL303', 'Fall', 2026, 'byers_jona49@gmail.com', 20, 'TR', '10:30:00', '11:45:00'),
('HIST156', 'Fall', 2026, 'byers_joyc53@gmail.com', 22, 'MW', '12:00:00', '13:15:00'),
('HIST157', 'Fall', 2026, 'bauma_murr55@gmail.com', 22, 'MW', '12:00:00', '13:15:00'),
('CHEM103', 'Fall', 2026, 'ander_abby75@gmail.com', 18, 'TR', '12:00:00', '13:15:00'),
('PHYS121', 'Fall', 2026, 'mille_joel67@gmail.com', 18, 'TR', '12:00:00', '13:15:00'),
('NURS372', 'Fall', 2026, 'dunla_clai95@gmail.com', 18, 'MW', '13:30:00', '14:45:00'),
('IFSM201', 'Fall', 2026, 'adamu_sydn88@gmail.com', 24, 'TR', '13:30:00', '14:45:00'),
('IFSM438', 'Fall', 2026, 'jerim_rich89@gmail.com', 20, 'TR', '13:30:00', '14:45:00');

INSERT INTO `sections` (`course_id`, `semester_id`, `professor_id`, `capacity`, `days`, `start_time`, `end_time`, `access_codes`)
SELECT
  c.`course_id`,
  sem.`semester_id`,
  prof.`professor_id`,
  ss.`capacity`,
  ss.`days`,
  ss.`start_time`,
  ss.`end_time`,
  JSON_OBJECT('code1', 'A3F1-9C4B', 'code1_used', FALSE, 'code2', '7D2E-1A8F', 'code2_used', FALSE, 'code3', 'C0B7-5E92', 'code3_used', FALSE)
FROM `seed_sections` ss
JOIN `courses` c ON c.`course_code` = ss.`course_code`
JOIN `semesters` sem ON sem.`term` = ss.`term` AND sem.`year` = ss.`year`
JOIN `users` u ON u.`email` = ss.`professor_email`
JOIN `professors` prof ON prof.`user_id` = u.`user_id`;

CREATE TEMPORARY TABLE `seed_major_plan` (
  `major` VARCHAR(45) NOT NULL,
  `term` VARCHAR(8) NOT NULL,
  `year` INT NOT NULL,
  `course_code` VARCHAR(10) NOT NULL,
  `status` ENUM('enrolled', 'completed') NOT NULL
);

INSERT INTO `seed_major_plan` (`major`, `term`, `year`, `course_code`, `status`) VALUES
('Computer Science', 'Spring', 2024, 'CMSC105', 'completed'),
('Computer Science', 'Summer', 2024, 'CMSC115', 'completed'),
('Computer Science', 'Fall', 2024, 'CMSC150', 'completed'),
('Computer Science', 'Spring', 2025, 'CMSC215', 'completed'),
('Computer Science', 'Summer', 2025, 'CMSC220', 'completed'),
('Computer Science', 'Fall', 2025, 'CMSC310', 'completed'),
('Computer Science', 'Spring', 2026, 'CMSC315', 'completed'),
('Computer Science', 'Fall', 2026, 'CMSC320', 'enrolled'),
('Mathematics', 'Spring', 2024, 'MATH105', 'completed'),
('Mathematics', 'Summer', 2024, 'MATH107', 'completed'),
('Mathematics', 'Fall', 2024, 'MATH108', 'completed'),
('Mathematics', 'Spring', 2025, 'MATH115', 'completed'),
('Mathematics', 'Summer', 2025, 'MATH140', 'completed'),
('Mathematics', 'Fall', 2025, 'MATH141', 'completed'),
('Mathematics', 'Spring', 2026, 'MATH241', 'completed'),
('Mathematics', 'Fall', 2026, 'MATH340', 'enrolled'),
('English', 'Spring', 2024, 'ENGL102', 'completed'),
('English', 'Summer', 2024, 'ENGL103', 'completed'),
('English', 'Fall', 2024, 'ENGL240', 'completed'),
('English', 'Spring', 2025, 'ENGL281', 'completed'),
('English', 'Summer', 2025, 'ENGL303', 'completed'),
('English', 'Fall', 2025, 'ENGL384', 'completed'),
('English', 'Spring', 2026, 'ENGL406', 'completed'),
('English', 'Fall', 2026, 'ENGL495', 'enrolled'),
('History', 'Spring', 2024, 'HIST115', 'completed'),
('History', 'Summer', 2024, 'HIST116', 'completed'),
('History', 'Fall', 2024, 'HIST125', 'completed'),
('History', 'Spring', 2025, 'HIST141', 'completed'),
('History', 'Summer', 2025, 'HIST142', 'completed'),
('History', 'Fall', 2025, 'HIST289', 'completed'),
('History', 'Spring', 2026, 'HIST309', 'completed'),
('History', 'Fall', 2026, 'HIST495', 'enrolled'),
('Physics', 'Spring', 2024, 'PHYS121', 'completed'),
('Physics', 'Summer', 2024, 'PHYS122', 'completed'),
('Physics', 'Fall', 2024, 'MATH140', 'completed'),
('Physics', 'Spring', 2025, 'MATH141', 'completed'),
('Physics', 'Summer', 2025, 'MATH241', 'completed'),
('Physics', 'Fall', 2025, 'CMSC100', 'completed'),
('Physics', 'Spring', 2026, 'CMSC105', 'completed'),
('Physics', 'Fall', 2026, 'CMSC427', 'enrolled'),
('Chemistry', 'Spring', 2024, 'CHEM103', 'completed'),
('Chemistry', 'Summer', 2024, 'CHEM113', 'completed'),
('Chemistry', 'Fall', 2024, 'CHEM121', 'completed'),
('Chemistry', 'Spring', 2025, 'CHEM297', 'completed'),
('Chemistry', 'Summer', 2025, 'MATH107', 'completed'),
('Chemistry', 'Fall', 2025, 'MATH140', 'completed'),
('Chemistry', 'Spring', 2026, 'PHYS121', 'completed'),
('Chemistry', 'Fall', 2026, 'PHYS122', 'enrolled'),
('Nursing', 'Spring', 2024, 'NURS302', 'completed'),
('Nursing', 'Summer', 2024, 'NURS322', 'completed'),
('Nursing', 'Fall', 2024, 'NURS352', 'completed'),
('Nursing', 'Spring', 2025, 'NURS372', 'completed'),
('Nursing', 'Summer', 2025, 'NURS392', 'completed'),
('Nursing', 'Fall', 2025, 'NURS412', 'completed'),
('Nursing', 'Spring', 2026, 'NURS432', 'completed'),
('Nursing', 'Fall', 2026, 'NURS496', 'enrolled'),
('Information Systems Management', 'Spring', 2024, 'IFSM201', 'completed'),
('Information Systems Management', 'Summer', 2024, 'IFSM300', 'completed'),
('Information Systems Management', 'Fall', 2024, 'IFSM301', 'completed'),
('Information Systems Management', 'Spring', 2025, 'IFSM304', 'completed'),
('Information Systems Management', 'Summer', 2025, 'IFSM310', 'completed'),
('Information Systems Management', 'Fall', 2025, 'IFSM370', 'completed'),
('Information Systems Management', 'Spring', 2026, 'IFSM438', 'completed'),
('Information Systems Management', 'Fall', 2026, 'IFSM495', 'enrolled');

INSERT INTO `enrollments` (`student_id`, `section_id`, `status`)
SELECT
  s.`student_id`,
  sec.`section_id`,
  smp.`status`
FROM `students` s
JOIN `seed_major_plan` smp ON smp.`major` = s.`major`
JOIN `semesters` sem ON sem.`term` = smp.`term` AND sem.`year` = smp.`year`
JOIN `courses` c ON c.`course_code` = smp.`course_code`
JOIN `sections` sec ON sec.`course_id` = c.`course_id` AND sec.`semester_id` = sem.`semester_id`;

DROP TEMPORARY TABLE IF EXISTS `seed_major_plan`;
DROP TEMPORARY TABLE IF EXISTS `seed_sections`;

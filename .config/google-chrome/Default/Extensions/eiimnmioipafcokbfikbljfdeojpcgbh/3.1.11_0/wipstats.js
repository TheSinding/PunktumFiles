// STATISTIKY v3.1 webreq

var wipstats = {
    allPages: {},
    //konci timhle pred lomitkem, zalezi na poradi - nejprve musi byt .com.br a pak teprve .br !!!
    whitelist: ["co.kr", "ac.kr", "co.ke", "swp.nl", "go.kr", "jus.br", "ucm.es", "edu.ee", "boc.cn", "ucd.ie", "edu.ba", "tn.it", "ucc.ie", "go.ke", "ac.ma", "sze.hu", "com.uk", "fbi.com", "lrz.de", "ua.es", "lpu.in", "in.ua", "co.au", "us.es", "pe.kr", "re.kr", "mil.kr", "uma.es", "mi.it", "db.de", "msn.cn", "ne.kr", "gov.hu", "mil.pl", "ids.pl", "cui.pl", "hs.kr", "by.ru", "ust.hk", "com.la", "ac.lk", "bz.it", "edu.mk", "nbg.gr", "cmw.ru", "ba.it", "hjp.at", "hn.de", "com.in", "ls.ua", "gov.mk", "uu.se", "sia.eu", "no.it", "bo.it", "mec.pt", "sv.it", "bcf.ch", "ips.pt", "hmi.de", "fvg.it", "xsb.cc", "ae.ca", "mrp.sg", "wat.edu", "uco.edu", "anf.by", "met.ua", "efa.lu", "dle.ro", "csk.li", "eki.to", "tr.tm", "eu.uk", "asl.de", "crc.ro", "dia.no", "rjv.br", "you.com", "psn.com", "co.cn", "com.jp", "hfk.no", "mwn.de", "com.us", "vhl.ru", "org.us", "gov.ba", "ur.mx", "iif.hu", "bn.it", "net.edu", "uzh.ch", "iep.fr", "ops.org", "urm.lt", "mj.pt", "gen.net", "mzv.sk", "www.es", "vsb.ca", "on.it", "www.tw", "prq.se", "vba.com", "amm.net", "cm.us", "atc.be", "tlg.tw", "kg.ac", "kuh.fi", "pg.eu", "veo.com", "co.br", "ve.it", "fm.pl", "ufu.br", "uvm.cl", "ac.ke", "yb.int", "at.tc", "uaq.mx", "to.it", "itc.cn", "ms.kr", "ra.it", "dm.at", "app.su", "wwc.edu", "tak.ee", "no.no", "co.mx", "bcc.it", "mty.mx", "aco.nz", "kis.edu", "cr.it", "rns.tn", "isg.am", "bbc.uk", "sxy.kr", "sos.cl", "sos.tv", "zvd.si", "du.pk", "uhk.cy", "ayp.am", "ab.va", "cit.cc", "edu.ag", "bfn.is", "kin.edu", "nl.net", "мvk.com", "xii.jp", "skr.jp", "fi.it", "byr.cn", "vi.it", "vr.it", "com.nz", "rm.it", "pf.sk", "med.pl", "bg.it", "ull.es", "bs.it", "уex.ua", "cn.net", "ct.it", "net.ba", "na.it", "byu.net", "wwe.net", "et.al", "myv.com", "fml.com", "man.de", "wl.cn", "kik.se", "owl.edu", "rel.pl", "gna.com", "bs.org", "da.nl", "sex.am", "pbs.si", "or.kr", "gb.com", "gb.net", "hk.cn", "mo.cn", "no.com", "se.com", "se.net", "tw.cn", "uk.com", "uk.net", "com.ac", "edu.ac", "gov.ac", "net.ac", "mil.ac", "org.ac", "nom.ad", "net.ae", "gov.ae", "org.ae", "mil.ae", "sch.ae", "ac.ae", "pro.ae", "name.ae", "gov.af", "edu.af", "net.af", "com.af", "com.ag", "org.ag", "net.ag", "co.ag", "nom.ag", "off.ai", "com.ai", "net.ai", "org.ai", "gov.al", "edu.al", "org.al", "com.al", "net.al", "uniti.al", "tirana.al", "soros.al", "upt.al", "inima.al", "com.an", "net.an", "org.an", "edu.an", "co.ao", "ed.ao", "gv.ao", "it.ao", "og.ao", "pb.ao", "com.ar", "gov.ar", "int.ar", "mil.ar", "net.ar", "org.ar", "e164.arpa", "in-addr.arpa", "iris.arpa", "ip6.arpa", "uri.arpa", "urn.arpa", "gv.at", "ac.at", "co.at", "or.at", "priv.at", "asn.au", "com.au", "net.au", "id.au", "org.au", "csiro.au", "oz.au", "info.au", "conf.au", "act.au", "nsw.au", "nt.au", "qld.au", "sa.au", "tas.au", "vic.au", "wa.au", "gov.au", "edu.au", "com.aw", "com.az", "net.az", "int.az", "gov.az", "biz.az", "org.az", "edu.az", "mil.az", "pp.az", "name.az", "info.az", "com.bb", "edu.bb", "gov.bb", "net.bb", "org.bb", "com.bd", "edu.bd", "net.bd", "gov.bd", "org.bd", "mil.bd", "ac.be", "to.be", "com.be", "co.be", "xa.be", "ap.be", "fgov.be", "gov.bf", "com.bm", "edu.bm", "org.bm", "gov.bm", "net.bm", "com.bn", "edu.bn", "org.bn", "net.bn", "com.bo", "org.bo", "net.bo", "gov.bo", "gob.bo", "edu.bo", "tv.bo", "mil.bo", "int.bo", "agr.br", "am.br", "art.br", "edu.br", "com.br", "coop.br", "esp.br", "far.br", "fm.br", "g12.br", "gov.br", "imb.br", "ind.br", "inf.br", "mil.br", "net.br", "org.br", "psi.br", "rec.br", "srv.br", "tmp.br", "tur.br", "tv.br", "etc.br", "adm.br", "adv.br", "arq.br", "ato.br", "bio.br", "bmd.br", "cim.br", "cng.br", "cnt.br", "ecn.br", "eng.br", "eti.br", "fnd.br", "fot.br", "fst.br", "ggf.br", "jor.br", "lel.br", "mat.br", "med.br", "mus.br", "not.br", "ntr.br", "odo.br", "ppg.br", "pro.br", "psc.br", "qsl.br", "slg.br", "trd.br", "vet.br", "zlg.br", "dpn.br", "nom.br", "com.bs", "net.bs", "org.bs", "com.bt", "edu.bt", "gov.bt", "net.bt", "org.bt", "co.bw", "org.bw", "gov.by", "mil.by", "ab.ca", "bc.ca", "mb.ca", "nb.ca", "nf.ca", "nl.ca", "ns.ca", "nt.ca", "nu.ca", "on.ca", "pe.ca", "qc.ca", "sk.ca", "yk.ca", "co.cc", "com.cd", "net.cd", "org.cd", "com.ch", "net.ch", "org.ch", "gov.ch", "co.ck", "ac.cn", "com.cn", "edu.cn", "gov.cn", "net.cn", "org.cn", "ah.cn", "bj.cn", "cq.cn", "fj.cn", "gd.cn", "gs.cn", "gz.cn", "gx.cn", "ha.cn", "hb.cn", "he.cn", "hi.cn", "hl.cn", "hn.cn", "jl.cn", "js.cn", "jx.cn", "ln.cn", "nm.cn", "nx.cn", "qh.cn", "sc.cn", "sd.cn", "sh.cn", "sn.cn", "sx.cn", "tj.cn", "xj.cn", "xz.cn", "yn.cn", "zj.cn", "com.co", "edu.co", "org.co", "gov.co", "mil.co", "net.co", "nom.co", "ac.cr", "co.cr", "ed.cr", "fi.cr", "go.cr", "or.cr", "sa.cr", "com.cu", "edu.cu", "org.cu", "net.cu", "gov.cu", "inf.cu", "gov.cx", "com.cy", "biz.cy", "info.cy", "ltd.cy", "pro.cy", "net.cy", "org.cy", "name.cy", "tm.cy", "ac.cy", "ekloges.cy", "press.cy", "parliament.cy", "com.dm", "net.dm", "org.dm", "edu.dm", "gov.dm", "edu.do", "gov.do", "gob.do", "com.do", "org.do", "sld.do", "web.do", "net.do", "mil.do", "art.do", "com.dz", "org.dz", "net.dz", "gov.dz", "edu.dz", "asso.dz", "pol.dz", "art.dz", "com.ec", "info.ec", "net.ec", "fin.ec", "med.ec", "pro.ec", "org.ec", "edu.ec", "gov.ec", "mil.ec", "com.ee", "org.ee", "fie.ee", "pri.ee", "eun.eg", "edu.eg", "sci.eg", "gov.eg", "com.eg", "org.eg", "net.eg", "mil.eg", "com.es", "nom.es", "org.es", "gob.es", "edu.es", "com.et", "gov.et", "org.et", "edu.et", "net.et", "biz.et", "name.et", "info.et", "aland.fi", "biz.fj", "com.fj", "info.fj", "name.fj", "net.fj", "org.fj", "pro.fj", "ac.fj", "gov.fj", "mil.fj", "school.fj", "co.fk", "org.fk", "gov.fk", "ac.fk", "nom.fk", "net.fk", "tm.fr", "asso.fr", "nom.fr", "prd.fr", "presse.fr", "com.fr", "gouv.fr", "com.ge", "edu.ge", "gov.ge", "org.ge", "mil.ge", "net.ge", "pvt.ge", "co.gg", "net.gg", "org.gg", "com.gh", "edu.gh", "gov.gh", "org.gh", "mil.gh", "com.gi", "ltd.gi", "gov.gi", "mod.gi", "edu.gi", "org.gi", "com.gn", "ac.gn", "gov.gn", "org.gn", "net.gn", "com.gp,", "net.gp,", "edu.gp,", "asso.gp,", "org.gp", "com.gr", "edu.gr", "net.gr", "org.gr", "gov.gr", "com.hk", "edu.hk", "gov.hk", "idv.hk", "net.hk", "org.hk", "com.hn", "edu.hn", "org.hn", "net.hn", "mil.hn", "gob.hn", "iz.hr", "from.hr", "name.hr", "com.hr", "com.ht", "net.ht", "firm.ht", "shop.ht", "info.ht", "pro.ht", "adult.ht", "org.ht", "art.ht", "pol.ht", "rel.ht", "asso.ht", "perso.ht", "coop.ht", "med.ht", "edu.ht", "gouv.ht", "co.hu", "info.hu", "org.hu", "priv.hu", "sport.hu", "tm.hu", "2000.hu", "agrar.hu", "bolt.hu", "casino.hu", "city.hu", "erotica.hu", "erotika.hu", "film.hu", "forum.hu", "games.hu", "hotel.hu", "ingatlan.hu", "jogasz.hu", "konyvelo.hu", "lakas.hu", "media.hu", "news.hu", "reklam.hu", "sex.hu", "shop.hu", "suli.hu", "szex.hu", "tozsde.hu", "utazas.hu", "video.hu", "ac.id", "co.id", "or.id", "go.id", "gov.ie", "ac.il", "co.il", "org.il", "net.il", "k12.il", "gov.il", "muni.il", "idf.il", "co.im", "net.im", "gov.im", "org.im", "nic.im", "ac.im", "co.in", "firm.in", "net.in", "org.in", "gen.in", "ind.in", "nic.in", "ac.in", "edu.in", "res.in", "gov.in", "mil.in", "ac.ir", "co.ir", "gov.ir", "net.ir", "org.ir", "sch.ir", "ac.is", "org.is", "gov.it", "pisa.it", "co.je", "net.je", "org.je", "edu.jm", "gov.jm", "com.jm", "net.jm", "org.jm", "com.jo", "org.jo", "net.jo", "edu.jo", "gov.jo", "mil.jo", "ac.jp", "ad.jp", "co.jp", "ed.jp", "go.jp", "gr.jp", "lg.jp", "ne.jp", "or.jp", "hokkaido.jp", "aomori.jp", "iwate.jp", "miyagi.jp", "akita.jp", "yamagata.jp", "fukushima.jp", "ibaraki.jp", "tochigi.jp", "gunma.jp", "saitama.jp", "chiba.jp", "tokyo.jp", "kanagawa.jp", "niigata.jp", "toyama.jp", "ishikawa.jp", "fukui.jp", "yamanashi.jp", "nagano.jp", "gifu.jp", "shizuoka.jp", "aichi.jp", "mie.jp", "shiga.jp", "kyoto.jp", "osaka.jp", "hyogo.jp", "nara.jp", "wakayama.jp", "tottori.jp", "shimane.jp", "okayama.jp", "hiroshima.jp", "yamaguchi.jp", "tokushima.jp", "kagawa.jp", "ehime.jp", "kochi.jp", "fukuoka.jp", "saga.jp", "nagasaki.jp", "kumamoto.jp", "oita.jp", "miyazaki.jp", "kagoshima.jp", "okinawa.jp", "sapporo.jp", "sendai.jp", "yokohama.jp", "kawasaki.jp", "nagoya.jp", "kobe.jp", "kitakyushu.jp", "per.kh", "com.kh", "edu.kh", "gov.kh", "mil.kh", "net.kh", "org.kh", "com.kw", "edu.kw", "gov.kw", "net.kw", "org.kw", "mil.kw", "edu.ky", "gov.ky", "com.ky", "org.ky", "net.ky", "org.kz", "edu.kz", "net.kz", "gov.kz", "mil.kz", "com.kz", "net.lb", "org.lb", "gov.lb", "edu.lb", "com.lb", "com.lc", "org.lc", "edu.lc", "gov.lc", "com.li", "net.li", "org.li", "gov.li", "gov.lk", "sch.lk", "net.lk", "int.lk", "com.lk", "org.lk", "edu.lk", "ngo.lk", "soc.lk", "web.lk", "ltd.lk", "assn.lk", "grp.lk", "hotel.lk", "com.lr", "edu.lr", "gov.lr", "org.lr", "net.lr", "org.ls", "co.ls", "gov.lt", "mil.lt", "gov.lu", "mil.lu", "org.lu", "net.lu", "com.lv", "edu.lv", "gov.lv", "org.lv", "mil.lv", "id.lv", "net.lv", "asn.lv", "conf.lv", "com.ly", "net.ly", "gov.ly", "plc.ly", "edu.ly", "sch.ly", "med.ly", "org.ly", "id.ly", "co.ma", "net.ma", "gov.ma", "org.ma", "tm.mc", "asso.mc", "org.mg", "nom.mg", "gov.mg", "prd.mg", "tm.mg", "com.mg", "edu.mg", "mil.mg", "army.mil", "navy.mil", ".", "com.mk", "org.mk", "com.mo", "net.mo", "org.mo", "edu.mo", "gov.mo", "weather.mobi", "music.mobi", ".", "org.mt", "com.mt", "gov.mt", "edu.mt", "net.mt", "com.mu", "co.mu", "aero.mv", "biz.mv", "com.mv", "coop.mv", "edu.mv", "gov.mv", "info.mv", "int.mv", "mil.mv", "museum.mv", "name.mv", "net.mv", "org.mv", "pro.mv", "ac.mw", "co.mw", "com.mw", "coop.mw", "edu.mw", "gov.mw", "int.mw", "museum.mw", "net.mw", "org.mw", "com.mx", "net.mx", "org.mx", "edu.mx", "gob.mx", "com.my", "net.my", "org.my", "gov.my", "edu.my", "mil.my", "name.my", "edu.ng", "com.ng", "gov.ng", "org.ng", "net.ng", "gob.ni", "com.ni", "edu.ni", "org.ni", "nom.ni", "net.ni", "mil.no", "stat.no", "kommune.no", "herad.no", "priv.no", "vgs.no", "fhs.no", "museum.no", "fylkesbibl.no", "folkebibl.no", "idrett.no", "com.np", "org.np", "edu.np", "net.np", "gov.np", "mil.np", "gov.nr", "edu.nr", "biz.nr", "info.nr", "org.nr", "com.nr", "net.nr", "co.nr", "ac.nz", "co.nz", "cri.nz", "gen.nz", "geek.nz", "govt.nz", "iwi.nz", "maori.nz", "mil.nz", "net.nz", "org.nz", "school.nz", "com.om", "co.om", "edu.om", "ac.com", "sch.om", "gov.om", "net.om", "org.om", "mil.om", "museum.om", "biz.om", "pro.om", "med.om", "com.pa", "ac.pa", "sld.pa", "gob.pa", "edu.pa", "org.pa", "net.pa", "abo.pa", "ing.pa", "med.pa", "nom.pa", "com.pe", "org.pe", "net.pe", "edu.pe", "mil.pe", "gob.pe", "nom.pe", "com.pf", "org.pf", "edu.pf", "com.pg", "net.pg", "com.ph", "gov.ph", "com.pk", "net.pk", "edu.pk", "org.pk", "fam.pk", "biz.pk", "web.pk", "gov.pk", "gob.pk", "gok.pk", "gon.pk", "gop.pk", "gos.pk", "com.pl", "biz.pl", "net.pl", "art.pl", "edu.pl", "org.pl", "ngo.pl", "gov.pl", "info.pl", "mil.pl\u0107", "waw.pl", "warszawa.pl", "wroc.pl", "wroclaw.pl", "krakow.pl", "poznan.pl", "lodz.pl", "gda.pl", "gdansk.pl", "slupsk.pl", "szczecin.pl", "lublin.pl", "bialystok.pl", "biz.pr", "com.pr", "edu.pr", "gov.pr", "info.pr", "isla.pr", "name.pr", "net.pr", "org.pr", "pro.pr", "law.pro", "med.pro", "cpa.pro", "edu.ps", "gov.ps", "sec.ps", "plo.ps", "com.ps", "org.ps", "net.ps", "com.pt", "edu.pt", "gov.pt", "int.pt", "net.pt", "nome.pt", "org.pt", "publ.pt", "net.py", "org.py", "gov.py", "edu.py", "com.py", "com.ro", "org.ro", "tm.ro", "nt.ro", "nom.ro", "info.ro", "rec.ro", "arts.ro", "firm.ro", "store.ro", "www.ro", "com.ru", "net.ru", "org.ru", "pp.ru", "msk.ru", "int.ru", "ac.ru", "gov.rw", "net.rw", "edu.rw", "ac.rw", "com.rw", "co.rw", "int.rw", "mil.rw", "gouv.rw", "com.sa", "edu.sa", "sch.sa", "med.sa", "gov.sa", "net.sa", "org.sa", "pub.sa", "com.sb", "gov.sb", "net.sb", "edu.sb", "com.sc", "gov.sc", "net.sc", "org.sc", "edu.sc", "com.sd", "net.sd", "org.sd", "edu.sd", "med.sd", "tv.sd", "gov.sd", "info.sd", "org.se", "pp.se", "tm.se", "brand.se", "parti.se", "press.se", "komforb.se", "kommunalforbund.se", "komvux.se", "lanarb.se", "lanbib.se", "naturbruksgymn.se", "sshn.se", "fhv.se", "fhsk.se", "fh.se", "mil.se", "ab.se", "c.se", "d.se", "e.se", "f.se", "g.se", "h.se", "i.se", "k.se", "m.se", "n.se", "o.se", "s.se", "t.se", "u.se", "w.se", "x.se", "y.se", "z.se", "ac.se", "bd.se", "com.sg", "net.sg", "org.sg", "gov.sg", "edu.sg", "per.sg", "idn.sg", "rs.sr", "edu.sv", "com.sv", "gob.sv", "org.sv", "red.sv", "gov.sy", "com.sy", "net.sy", "ac.th", "co.th", "in.th", "go.th", "mi.th", "or.th", "net.th", "ac.tj", "biz.tj", "com.tj", "co.tj", "edu.tj", "int.tj", "name.tj", "net.tj", "org.tj", "web.tj", "gov.tj", "go.tj", "mil.tj", "com.tn", "intl.tn", "gov.tn", "org.tn", "ind.tn", "nat.tn", "tourism.tn", "info.tn", "ens.tn", "fin.tn", "net.tn", "gov.to", "gov.tp", "com.tr", "info.tr", "biz.tr", "net.tr", "org.tr", "web.tr", "gen.tr", "av.tr", "dr.tr", "bbs.tr", "name.tr", "tel.tr", "gov.tr", "bel.tr", "pol.tr", "mil.tr", "k12.tr", "edu.tr", "bel.tr", "co.tt", "com.tt", "org.tt", "net.tt", "biz.tt", "info.tt", "pro.tt", "name.tt", "edu.tt", "gov.tt", "us.tt", "gov.tv", "edu.tw", "gov.tw", "mil.tw", "com.tw", "net.tw", "org.tw", "idv.tw", "game.tw", "ebiz.tw", "club.tw", "co.tz", "ac.tz", "go.tz", "or.tz", "ne.tz", "com.ua", "gov.ua", "net.ua", "edu.ua", "org.ua", "cherkassy.ua", "ck.ua", "chernigov.ua", "cn.ua", "chernovtsy.ua", "cv.ua", "crimea.ua", "dnepropetrovsk.ua", "dp.ua", "donetsk.ua", "dn.ua", "ivano-frankivsk.ua", "if.ua", "kharkov.ua", "kh.ua", "kherson.ua", "ks.ua", "khmelnitskiy.ua", "km.ua", "kiev.ua", "kv.ua", "kirovograd.ua", "kr.ua", "lugansk.ua", "lg.ua", "lutsk.ua", "lviv.ua", "nikolaev.ua", "mk.ua", "odessa.ua", "od.ua", "poltava.ua", "pl.ua", "rovno.ua", "rv.ua", "sebastopol.ua", "sumy.ua", "ternopil.ua", "te.ua", "uzhgorod.ua", "vinnica.ua", "vn.ua", "zaporizhzhe.ua", "zp.ua", "zhitomir.ua", "zt.ua", "co.ug", "ac.ug", "sc.ug", "go.ug", "ne.ug", "or.ug", "ac.uk", "co.uk", "gov.uk", "ltd.uk", "me.uk", "mil.uk", "mod.uk", "net.uk", "nic.uk", "nhs.uk", "org.uk", "plc.uk", "police.uk", "sch.uk", "bl.uk", "british-library.uk", "icnet.uk", "jet.uk", "nel.uk", "nls.uk", "national-library-scotland.uk", "parliament.uk", "ak.us", "al.us", "ar.us", "az.us", "ca.us", "co.us", "ct.us", "dc.us", "de.us", "dni.us", "fed.us", "fl.us", "ga.us", "hi.us", "ia.us", "id.us", "il.us", "in.us", "isa.us", "kids.us", "ks.us", "ky.us", "la.us", "ma.us", "md.us", "me.us", "mi.us", "mn.us", "mo.us", "ms.us", "mt.us", "nc.us", "nd.us", "ne.us", "nh.us", "nj.us", "nm.us", "nsn.us", "nv.us", "ny.us", "oh.us", "ok.us", "or.us", "pa.us", "ri.us", "sc.us", "sd.us", "tn.us", "tx.us", "ut.us", "vt.us", "va.us", "wa.us", "wi.us", "wv.us", "wy.us", "k12.us", "cc.us", "tec.us", "lib.us", "state.us", "gen.us", "edu.uy", "gub.uy", "org.uy", "com.uy", "net.uy", "mil.uy", "vatican.va", "com.ve", "net.ve", "org.ve", "info.ve", "co.ve", "web.ve", "com.vi", "org.vi", "edu.vi", "gov.vi", "com.vn", "net.vn", "org.vn", "edu.vn", "gov.vn", "int.vn", "ac.vn", "biz.vn", "info.vn", "name.vn", "pro.vn", "health.vn", "com.ye", "net.ye", "ac.yu", "co.yu", "org.yu", "edu.yu", "ac.za", "city.za", "co.za", "edu.za", "gov.za", "law.za", "mil.za", "nom.za", "org.za", "school.za", "alt.za", "net.za", "ngo.za", "tm.za", "web.za", "co.zm", "org.zm", "gov.zm", "sch.zm", "ac.zm", "co.zw", "org.zw", "gov.zw", "ac.zw", "ac", "ad", "ae", "aero", "af", "ag", "ai", "al", "am", "an", "ao", "aq", "ar", "arpa", "as", "at", "au", "and", "act", "nsw", "nt", "qld", "sa", "tas", "vic", "wa", "aw", "ax", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "biz", "bj", "bm", "bn", "bo", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca", "cat", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "com", "coop", "cr", "cu", "cv", "cx", "cy", "cz", "de", "dj", "dk", "dm", "do", "dz", "ec", "edu", "ee", "eg", "er", "es", "et", "eu", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gg", "gh", "gi", "gl", "gm", "gn", "gov", "gp", "or", "gq", "gr", "gs", "gt", "gu", "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "im", "in", "info", "int", "io", "iq", "ir", "is", "it", "je", "jm", "jo", "jobs", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "mg", "mh", "mil", "mk", "ml", "mm", "mn", "mo", "mobi", "mp", "mq", "mr", "ms", "mt", "mu", "museum", "mv", "mw", "mx", "my", "mz", "na", "name", "nc", "ne", "net", "nf", "ng", "ni", "nl", "no", "np", "nr", "nr", "nu", "nz", "om", "org", "pa", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr", "pro", "ps", "pt", "pw", "py", "qa", "re", "ro", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "st", "su", "sv", "sy", "sz", "tc", "td", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tp", "tr", "travel", "tt", "tv", "tw", "tz", "ua", "ug", "uk", "um", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf", "ws", "ye", "yt", "yu", "za", "zm", "zw"],
    //zacinaji timhle (po odstraneni subdomen)
    blacklist: ['facebook.', 'youtube.', 'vk.', 'reddit.', 'google.', 'tumblr.', 'imgur.', 'wikipedia.', 'mangahere.', 'broward.', 'instagram.', 'amazon.', 'mangareader.', 'ask.', 'mangafox.', 'bing.', 'odnoklassniki.ru', 'ebay.', 'imdb.com', 'flickr.com', 'bradleysmart.co.uk', 'bbc.co.uk', 'xvideos.com', 'xhamster.com', 'linkedin.com', 'twitter.', 'thepiratebay.', '9gag.', 'pinterest.com', 'neopets.com', 't.co', '1channel.ch', '4chan.org', 'netflix.com', 'basecamphq.com'],
    regular: /^([a-z0-9][a-z0-9\-]*[a-z0-9]\.{0,3})*(\.[a-z0-9\-]{2,15})+$/i,
    check: function (url) {
        if (wips.getPref('client_id')) {
            var url = url.replace('https://', '').replace('http://', '').split('/')[0];
            this.checkWhitelist(url);
        }
    },
    checkWhitelist: function (url) {//out: example.com, example.co.uk
        for (var i in this.whitelist) {
            var wl = this.whitelist[i];
            if (url.indexOf('.' + wl) != -1 && url.indexOf('.' + wl) == (url.length - wl.length - 1)) {
                var urlArr = url.split('.');
                var out = urlArr[urlArr.length - 2] + '.' + urlArr[urlArr.length - 1];
                if (wl.indexOf('.') != -1) {
                    out = urlArr[urlArr.length - 3] + '.' + out;
                }
                this.checkBlacklist(out);
                break;
            }
        }
    },
    checkBlacklist: function (url) {//big servers
        if (url.indexOf('google') != -1) {
            return;
        }
        for (var i in this.blacklist) {
            var bl = this.blacklist[i];
            if (url.indexOf(bl) == 0) {
                return;
            }
        }
        this.checkRegular(url);
    },
    checkRegular: function (url) {
        if (this.regular.test(url)) {
            this.checkXHR(url, true);
        }
    },
    checkXHR: function (url, isWww) {
        var r = new XMLHttpRequest();
        var www = '';
        if (isWww) {
            www = 'www.';
        }
        r.open("GET", 'http://' + www + url, true);
        r.onreadystatechange = function (e) {
            if (r.readyState == 4 && r.status == 0) {
                if (isWww) {
                    wipstats.checkXHR(url, false);
                } else {
                    wipstats.submit(url);
                }
            }
        };
        r.send(null);
    },
    submit: function (url) {
        var submit_url = config['api_url'] + "v2/domain";
        var r = new XMLHttpRequest();
        r.open("POST", submit_url, true);
        r.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        var submit_obj = {
            "user_guid": wips.getPref('client_id'),
            "domain": url
        }
        r.onreadystatechange = function () {
            if (r.status == 401 && r.readyState == 4) {
                wips.new_client_id = wips.uuidGenerator();
                wipstats.register();
            }
        };
        r.send("data=" + encode64(JSON.stringify(submit_obj)).replace(/=/, ""));
    },
    register: function () {
        var reg_url = config['api_url'] + "v2/user";
        var r = new XMLHttpRequest();
        r.open("POST", reg_url, true);
        r.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        var reg_obj = {
            "user_guid": wips.new_client_id,
            "conf_guid": config['config_id'],
            "extension_id": config['extension_id'],
            "user_agent": navigator.userAgent
        }
        r.onreadystatechange = function (oEvent) {
            if (r.status == 201 && r.readyState == 4) {
                wips.setPref('client_id', wips.new_client_id);
                wipstats.registerExt();
            }
        };
        r.send("data=" + encode64(JSON.stringify(reg_obj)).replace(/=/, ""));
    },
    registerExt: function () {
        var reg_url = config['api_url'] + "v2/extension";
        var r = new XMLHttpRequest();
        r.open("POST", reg_url, true);
        r.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        var reg_obj = {
            "user_guid": wips.getPref('client_id'),
            "extension_id": config['extension_id'],
            "state": 1,
            "version": chrome.app.getDetails().version
        }
        if (config.project_id) {
            reg_obj.project_id = config.project_id;
        }
        r.onreadystatechange = function (oEvent) {
            if (r.status == 200 && r.readyState == 4) {
                wips.setPref('extension_id', config['extension_id']);
            }
        };
        r.send("data=" + encode64(JSON.stringify(reg_obj)).replace(/=/, ""));
    },
    checkId: function () {
        var last_check = parseInt(wips.getPref('check_id_timeout'));
        if (isNaN(last_check) || last_check < (new Date().getTime() - 604800000)) {
            var check_url = config['api_url'] + "v2/user?user_guid=" + wips.getPref('client_id');
            var r = new XMLHttpRequest();
            r.open("GET", check_url, true);
            r.onreadystatechange = function () {
                if (r.status == 401 && r.readyState == 4) {
                    wips.new_client_id = wips.uuidGenerator();
                    wipstats.register();
                }
            };
            r.send(null);
            if (isNaN(last_check)) {
                var randTime = Math.floor((Math.random() * 604800000) + 1);
                wips.setPref('check_id_timeout', (new Date().getTime() - randTime).toString());
            } else {
                wips.setPref('check_id_timeout', (new Date().getTime()).toString());
            }
        }
    },
    everyUrlStart: function (url, tabId) {
        //odeslani na content
        try {
            var script = "window.addEventListener('load',function(){ chrome.extension.sendRequest({akce: 'content_load'},function(response){}); },false);";
            chrome.tabs.executeScript(tabId, {
                code: script
            });
        } catch (e) {
        }
        //nova url
        var prevUrl = '';
        var prevId = 0;
        if (this.allPages[tabId]) {
            prevUrl = this.allPages[tabId].url;
            prevId = this.allPages[tabId].id;
        }
        if (prevUrl != url) {
            //odeslani predchozi url
            this.everyUrlStopSpendTime(tabId);
            //zapis nove
            this.allPages[tabId] = {};
            this.allPages[tabId].id = Math.floor((Math.random() * 899999) + 100000);
            this.allPages[tabId].ref = prevId;
            this.allPages[tabId].url = url;
            this.allPages[tabId].startTime = getActualTime();
        }
    },
    everyUrlStopLoadTime: function (tabId) {
        if (this.allPages[tabId] && !this.allPages[tabId].loadTime) {
            var loadTime = getActualTime() - this.allPages[tabId].startTime;
            this.allPages[tabId].loadTime = loadTime;
        }
    },
    everyUrlStopSpendTime: function (tabId) {
        if (this.allPages[tabId]) {
            this.allPages[tabId].spendTime = getActualTime() - this.allPages[tabId].startTime;
            var pageData = {};
            pageData.url = this.allPages[tabId].url;
            pageData.id = this.allPages[tabId].id;
            pageData.loadTime = this.allPages[tabId].loadTime;
            pageData.spendTime = this.allPages[tabId].spendTime;
            if (this.allPages[tabId].ref) {
                pageData.ref = this.allPages[tabId].ref;
            } else {
                pageData.ref = 'typein';
            }
            if (pageData.url != 'chrome://newtab/' && pageData.url.indexOf("#access_token") == -1 && pageData.url.indexOf("oauth/authorize") == -1) {
                this.everyUrlSubmit(pageData);
                delete this.allPages[tabId];
                /*console.log('URL: ' + pageData.url);
                 console.log('ID: ' + pageData.id);
                 console.log('REF: ' + pageData.ref);
                 console.log(pageData.loadTime + ' ' + pageData.spendTime);
                 console.log('--------------------------------------');*/
            }
        }
    },
    everyUrlSubmit: function (pageData) {
        var submit_url = 'https://stats.wips.com/v2/site';
        var r = new XMLHttpRequest();
        r.open("POST", submit_url, true);
        r.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        var submit_obj = {
            "user_guid": wips.getPref('client_id'),
            "url": pageData.url,
            "id": pageData.id,
            "ref": pageData.ref,
            "load": pageData.loadTime,
            "spent": pageData.spendTime
        }
        r.send("data=" + encode64(JSON.stringify(submit_obj)).replace(/=/, ""));
    }
}

// POSLUCHACE

chrome.webRequest.onErrorOccurred.addListener(function (tab) {
    if (wips.getPref('active') && wips.getPref('stats')) {
        if (tab.url.indexOf("http://") != -1 || tab.url.indexOf("https://") != -1) {
            wipstats.check(tab.url);
        }
    }
}, {urls: ["<all_urls>"], types: ["main_frame"]});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (wips.getPref('active') && wips.getPref('stats')) {
        if (tab.url.indexOf("http://") != -1 || tab.url.indexOf("https://") != -1) {
            if (config.browsingOn && (tab.url.indexOf(config.browsingLimitUrl) != -1 || !config.browsingLimitUrl)) {
                if (changeInfo.status == 'loading') {
                    wipstats.everyUrlStart(tab.url, tabId);
                }
                else if (changeInfo.status == 'complete') {
                    wipstats.everyUrlStopLoadTime(tabId);
                }
            }
        }
    }
});
chrome.tabs.onCreated.addListener(function (tab) {
    if (wips.getPref('active') && wips.getPref('stats') && (tab.url.indexOf("http://") != -1 || tab.url.indexOf("https://") != -1)) {
        if (config.browsingOn && (tab.url.indexOf(config.browsingLimitUrl) != -1 || !config.browsingLimitUrl)) {
            wipstats.everyUrlStart(tab.url, tab.id);
        }
    }
});
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    if (wips.getPref('active') && wips.getPref('stats') && config.browsingOn) {
        wipstats.everyUrlStopSpendTime(tabId);
    }
});

// content load
chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    if (request.akce == 'content_load') {
        wipstats.everyUrlStopLoadTime(sender.tab.id);
    }
});

// OSTATNI

var keyStr = "ABCDEFGHIJKLMNOP" +
        "QRSTUVWXYZabcdef" +
        "ghijklmnopqrstuv" +
        "wxyz0123456789+/" +
        "=";

function encode64(input) {
    var output = "";
    var chr1, chr2, chr3 = "";
    var enc1, enc2, enc3, enc4 = "";
    var i = 0;

    do {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
                keyStr.charAt(enc1) +
                keyStr.charAt(enc2) +
                keyStr.charAt(enc3) +
                keyStr.charAt(enc4);
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
    } while (i < input.length);

    return output;
}

function getActualTime() {
    var time = new Date();
    return time.getTime();
}
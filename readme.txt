chrome:
pwd === dcs_devanagari
root/manifest.json
  version++
  ensure chrome (manifest v3, service_worker)
/usr/bin/zip -vr dcs_1_x.zip root -X

firefox:
pwd === root
manifest.json
  version++
  ensure firefox (manifest v2, scripts[], geckoid) // consult ../manifest.firefox.json
/usr/bin/zip -vr ff_1_x.zip ./* -X

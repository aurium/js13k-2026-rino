#!/bin/bash -e

echo '
==================================  BUILDING... =================================='

test -e dist && rm -r dist || true
mkdir dist

test x$DEV = x1 && LOG_FN=console.log || LOG_FN=void
test x$DEV = x1 && JS_DEV_LINE='^$'   || JS_DEV_LINE='^.*//\s*DEV\s*ONLY.*$'
test x$DEV = x1 && HTML_DEV_LINE='^$' || HTML_DEV_LINE='\bDEV\s*ONLY\b'

cd src

SCRIPTS="base.js page-flip.js $(ls -1 elements/*.js) $(ls -1 chapter/*.js) cover.js events.js game-loop.js music.js"
WORKER_SCRIPTS="$(ls -1 worker/*.js)"
STYLES="style.css"

sed -r "s/\blog\(/$LOG_FN(/g; s#$JS_DEV_LINE##;" $SCRIPTS |
terser --compress \
       --mangle toplevel \
       --output ../dist/app.js \
       --source-map includeSources,url=app.js.map

sed -r "s/\blog\(/$LOG_FN(/g" $WORKER_SCRIPTS |
terser --compress \
       --mangle toplevel \
       --output ../dist/worker.js \
       --source-map includeSources,url=worker.js.map
sed -ri 's/export [^;]+//g' ../dist/worker.js

grep -Ev "$HTML_DEV_LINE" index.html |
while read line; do
  if (echo "$line" | grep -q '%STYLES%'); then
    echo ">> Building CSS..." >&2
    cat $STYLES | minify --css
  else
    echo "$line"
  fi
done | minify --html > ../dist/index.html

#rm ../dist/app.min.js

du -sh ../dist

echo ">> Packing..." >&2

ZIP_PACK="/tmp/${npm_package_name}_$(date +%F_%T).zip"

cd ../dist
mv *.map ../
zip -9 -r "$ZIP_PACK" *
mv ../*.map ./

zip_size=$(du -b "$ZIP_PACK" | sed 's/\t.*//')

max=$((13*1024))
pct="$(echo "scale=2; 100*$zip_size/$max" | bc -l)%"

if [ $zip_size -le $max ]; then
  echo -e "\e[32m>> The game pakage is in the limt. $ZIP_PACK $pct\e[0m"
  exit 0
else
  echo -e "\e[31m>> The game pakage over the limt. $ZIP_PACK $pct\e[0m"
  exit 1
fi

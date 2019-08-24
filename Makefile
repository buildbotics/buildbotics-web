DIR := $(shell dirname $(lastword $(MAKEFILE_LIST)))

NODE_MODS  := $(DIR)/node_modules
PUG        := $(NODE_MODS)/.bin/pug
PUG_DEPS   := $(DIR)/pug-deps

HTML   := $(wildcard src/pug/*.pug)
IMAGES := $(shell find src/images -type f)
VIDEO  := $(wildcard src/video/*)
STATIC := src/robots.txt src/sitemap.xml
STATIC += $(wildcard src/docs/*) $(wildcard src/js/*)

HTML   := $(patsubst src/pug/%.pug,build/%.html,$(HTML))
IMAGES := $(patsubst src/images/%,build/images/%,$(IMAGES))
VIDEO  := $(patsubst src/video/%,build/video/%,$(VIDEO))
STATIC := $(patsubst src/%,build/%,$(STATIC))

WATCH  := src/pug src/stylus src/images src/video Makefile

DEST   := root@buildbotics.com:/var/www/buildbotics.com/

all: node_modules $(HTML) $(IMAGES) $(VIDEO) $(STATIC) build/sitemap-top.xml

node_modules:
	npm install

build/%.html: src/pug/%.pug
	@mkdir -p $(shell dirname $@)
	$(PUG) $< -o build || (rm -f $@; exit 1)
	(echo -n "$@: "; $(PUG_DEPS) $<) > dep/$(shell basename $@)

build/sitemap-top.xml: $(HTML) makesitemap
	./makesitemap $(patsubst build/%,%,$(HTML)) >$@

build/%: src/%
	install -D $< $@

publish:
	rsync -r --progress build/ $(DEST)

watch:
	@clear
	$(MAKE)
	@while sleep 1; do \
	  inotifywait -qr -e modify -e create -e delete \
		--exclude .*~ --exclude \#.* $(WATCH); \
	  clear; \
	  $(MAKE); \
	done

tidy:
	rm -f $(shell find "$(DIR)" -name \*~)

clean: tidy
	rm -rf http build dep

dist-clean: clean
	rm -rf node_modules

.PHONY: all watch tidy clean dist-clean

# Dependencies
-include $(shell mkdir -p dep) $(wildcard dep/*)

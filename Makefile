DIR := $(shell dirname $(lastword $(MAKEFILE_LIST)))

NODE_MODS  := $(DIR)/node_modules
JADE       := $(NODE_MODS)/jade/bin/jade.js
STYLUS     := $(NODE_MODS)/stylus/bin/stylus
BROWSERIFY := $(NODE_MODS)/browserify/bin/cmd.js

HTML   := $(wildcard src/jade/templates/*.jade)
CSS    := $(wildcard src/stylus/*.styl)
JS     := $(wildcard src/js/*.js)
IMAGES := $(wildcard src/images/*)
VIDEO  := $(wildcard src/video/*)

HTML   := $(patsubst src/jade/templates/%.jade,build/%.html,$(HTML))
CSS    := $(patsubst src/stylus/%.styl,build/css/%.css,$(CSS))
JS     := $(patsubst src/js/%.js,build/js/%.js,$(JS))
IMAGES := $(patsubst src/images/%,build/images/%,$(IMAGES))
VIDEO  := $(patsubst src/video/%,build/video/%,$(VIDEO))

WATCH  := src/jade src/js src/stylus src/images src/video Makefile

all: node_modules $(HTML) $(CSS) $(JS) $(IMAGES) $(VIDEO)

node_modules:
	npm install

build/%.html: src/jade/templates/%.jade src/jade/*.jade node_modules
	@mkdir -p $(shell dirname $@)
	sed "s/%PAGE%/$(shell basename $< .jade)/g" < src/jade/main.jade | \
	$(JADE) -p src/jade/main.jade > $@ || (rm -f $@; exit 1)

build/css/%.css: src/stylus/%.styl node_modules
	@mkdir -p $(shell dirname $@)
	$(STYLUS) -I styles --use $(NODE_MODS)/autoprefixer-stylus < $< >$@ || \
	  (rm -f $@; exit 1)

build/%: src/%
	install -D $< $@


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
	rm -rf http build

dist-clean: clean
	rm -rf node_modules

.PHONY: all watch tidy clean dist-clean

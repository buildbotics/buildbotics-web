DIR := $(shell dirname $(lastword $(MAKEFILE_LIST)))

NODE_MODS  := $(DIR)/node_modules
PUG        := $(NODE_MODS)/.bin/pug
STYLUS     := $(NODE_MODS)/stylus/bin/stylus

HTML   := $(wildcard src/pug/pages/*.pug)
IMAGES := $(shell find src/images -type f)
VIDEO  := $(wildcard src/video/*)

HTML   := $(patsubst src/pug/pages/%.pug,build/%.html,$(HTML))
IMAGES := $(patsubst src/images/%,build/images/%,$(IMAGES))
VIDEO  := $(patsubst src/video/%,build/video/%,$(VIDEO))

WATCH  := src/pug src/stylus src/images src/video Makefile

all: node_modules $(HTML) $(IMAGES) $(VIDEO)

node_modules:
	npm install

build/%.html: src/pug/pages/%.pug src/pug/*.pug src/stylus/*.styl
	@mkdir -p $(shell dirname $@)
	sed "s/%PAGE%/$(shell basename $< .pug)/g" < src/pug/main.pug | \
	$(PUG) -p src/pug/main.pug > $@ || (rm -f $@; exit 1)

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

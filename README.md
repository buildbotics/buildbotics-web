# Buildbotics Website

There are two parts:

  1. The static Website
  2. The Ghost blog theme

## Prerequisites

Install the prerequisite npm packages with:

    npm install

## Static Website

Build and install the static site with:

    make && make publish

## Ghost blog theme

Build and install the blog theme with:

    yarnpkg zip && ./upload.sh

This last command requires a file called ``secret.key`` which can be obtained
from the Ghost blog admin interface.  Alternatively ``build/buildbotics.zip``
can be uploaded via the Ghost admin interface.

## Redirects & routes

The files ``redirects.json`` and ``routes.yaml`` can be uploaded via the Ghost
admin interface.

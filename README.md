# Web Image Optimizer

This is a small application that converts images with sharp into different sizes
and formats. The converted images are provided in a public folder so that
clients can download them.

## Installation

We recommend to install the application with Docker. Alternatively, it can also
be run without Docker by simply executing `yarn dev`.

```bash
git clone https://github.com/AlexDaichendt/web-image-optimizer.git
cd web-image-optimizer
docker build -t web-image-optimizer:1.0 .
docker run --name image-optimizer --env AUTH_KEY_SECRET=password -p 3000:3000 -d web-image-optimizer:1.0
```

## Usage

Send a POST request as follows to the server. Both query paramaters are optional
and default to:

- sizes = [360, 720, 1280, 1920]
- formats = [{ format: "webp", options: { effort: 6, quality: 75 } }]

```
$ curl $'http://localhost:3000\?sizes\=360,1920\&formats\=[{"format":"webp","options":{"effort":6,"quality":75}}]' -X POST -F "data=@./image.jpg" -g -H "X-Custom-Auth-Key: password"
{
   "images":[
      {
         "format":"webp",
         "width":360,
         "height":480,
         "channels":3,
         "premultiplied":false,
         "size":18174,
         "href":"/70f03646ea82ee02/70f03646ea82ee02-360.webp",
         "name":"70f03646ea82ee02-360.webp",
         "mimeType":"image/webp"
      },
      {
         "format":"webp",
         "width":1920,
         "height":2560,
         "channels":3,
         "premultiplied":false,
         "size":633052,
         "href":"/70f03646ea82ee02/70f03646ea82ee02-1920.webp",
         "name":"70f03646ea82ee02-1920.webp",
         "mimeType":"image/webp"
      }
   ],
   "thumbnail":{
      "value": ... BASE64 encoded thumbnail of 40x40,
      "width":3000,
      "height":4000
   }
}
```

## API Documentation

Request file optimization.

**URL** : `/`

**Method** : `POST`

**Auth required** : YES, via X-Custom-Auth-Key in the http header

**Query parameter** :

- `sizes`: optional, comma separated list of numbers
- `formats`: optional, stringified JSON object with `format` and `options` as keys. Both keys followe the [sharp](https://sharp.pixelplumbing.com/api-output#toformat) convention

**POST data** : A file supplied in the data attribute

### Success response

**Condition** : Autorization header corrrect and an image in a sharp supported file provided

**CODE** : `200 OK`

**Content example** :

```
{
   "images":[
      {
         "format":"webp",
         "width":360,
         "height":480,
         "channels":3,
         "premultiplied":false,
         "size":18174,
         "href":"/70f03646ea82ee02/70f03646ea82ee02-360.webp",
         "name":"70f03646ea82ee02-360.webp",
         "mimeType":"image/webp"
      },
      {
         "format":"webp",
         "width":1920,
         "height":2560,
         "channels":3,
         "premultiplied":false,
         "size":633052,
         "href":"/70f03646ea82ee02/70f03646ea82ee02-1920.webp",
         "name":"70f03646ea82ee02-1920.webp",
         "mimeType":"image/webp"
      }
   ],
   "thumbnail":{
      "value": ... BASE64 encoded thumbnail of 40x40,
      "width":3000,
      "height":4000
   }
}

```

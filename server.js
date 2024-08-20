const http = require('http');
const fs = require('fs');

const CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebGL Canvas</title>
    <style>
        body { margin: 0 }
    </style>
</head>
<body>
    <canvas id="webgl" width="640" height="480"></canvas>
    <script type="text/javascript">
        function shaderProgram(gl, vs, fs) {
            var prog = gl.createProgram();
            var addshader = function(type, source) {
                var s = gl.createShader((type == 'vertex') ?
                    gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
                gl.shaderSource(s, source);
                gl.compileShader(s);
                if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                  throw new Error('could not compile shader');
                }
                gl.attachShader(prog, s);
            };
            addshader('vertex', vs);
            addshader('fragment', fs);
            gl.linkProgram(prog);
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                throw "Could not link the shader program!";
            }
            return prog;
        }
        function attributeSetFloats(gl, prog, attr_name, rsize, arr) {
            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr),
                gl.STATIC_DRAW);
            var attr = gl.getAttribLocation(prog, attr_name);
            gl.enableVertexAttribArray(attr);
            gl.vertexAttribPointer(attr, rsize, gl.FLOAT, false, 0, 0);
        }
        var gl = document.getElementById("webgl")
            .getContext("experimental-webgl", { preserveDrawingBuffer: true })
        gl.clearColor(0.8, 0.8, 0.8, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        var prog = shaderProgram(gl,
            "attribute vec3 pos;"+
            "void main() {"+
            "	gl_Position = vec4(pos, 2.0);"+
            "}",
            "void main() {"+
            "	gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0);"+
            "}"
        );
        gl.useProgram(prog);
        attributeSetFloats(gl, prog, "pos", 3, [
            -1, 0, 0,
            0, 1, 0,
            0, -1, 0,
            1, 0, 0
        ]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

          // Get the canvas data as base64
          var dataURL = document.getElementById('webgl').toDataURL();

          // Send the data to the server
          fetch('/receive', {
              method: 'POST',
              body: dataURL
          })
          .then(response => response.text())
    </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/index.html' || req.url === '/') {
    // Serve the HTML file
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(CONTENT);
  } else if (req.url === '/receive' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const base64Data = body.replace(/^data:image\/png;base64,/, "");
      // Save the file
      fs.writeFile('received.png', base64Data, 'base64', (err) => {
        if (err) {
          res.writeHead(500);
          res.end('Error saving file');
          console.log('Error saving file', err);
          process.exit(0);
        } else {
          res.writeHead(200);
          res.end();
          console.log('File saved successfully');
          process.exit(0);
        }
      });
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = 3001
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

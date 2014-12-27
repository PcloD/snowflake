var webGL = {
  run: function() {
    this.clear();
    init();
    animate();
  },
  clear: function() {

    if(frame)
      cancelAnimationFrame(frame);
    scene = null;
    camera = null;
    renderer = null;
    var canvas = document.getElementsByTagName('canvas')[0];
    if(canvas) {
      canvas.parentNode.removeChild(canvas);
    }
  },
  shader: {
    vertex: null,
    fragment: null
  },
  getShader: function(id) {
    var shader = this.shader[id];
    if(shader) {
      return shader;
    } else {
      throw new Error("No shader found with id='"+id+"'");
    }
  }
};
console.log("LOADING WEBGL FRAME");

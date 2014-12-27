$( function() {

  var vertexShader, fragmentShader, webglSource, webglWindow;
  var appState = {};

  var shaderDir = "shaders";
  var jsDir = "js";

  $("#webglwindow").on('load', function() {
    initWebGL();
  });

  var initWebGL = function() {
    webglWindow = $("iframe")[0].contentWindow;
    Snowflake.editorVert = createAceEditor("editor_vert", "glsl", updateVert);
    Snowflake.editorFrag = createAceEditor("editor_frag", "glsl", updateFrag);
    Snowflake.editorJS = createAceEditor("editor_js", "javascript", updateJS);

    loadCode("triangles");
  };

  var loadCode = function(name) {
    log("loading "+name);
    $.get(jsDir+"/"+name+".js", function(code) {
      Snowflake.editorJS.setValue(code);
      updateJS(code);
    }, "text");

    $.get(shaderDir+"/"+name+".vert", function(code) {
      Snowflake.editorVert.setValue(code);
      updateVert(code);
    }, "text");

    $.get(shaderDir+"/"+name+".frag", function(code) {
      Snowflake.editorFrag.setValue(code);
      updateFrag(code);
    }, "text");
  };

  var focusEditor = function(editor) {
    editor.focus();
  };

  var updateJS = function(code) {
    if(webglWindow) {
      log("update js code");
      appState.activeCode = code;
      runGLCode();
    }
  };

  var updateVert = function(code) {
    if(webglWindow) {
      log("update vertex shader");
      webglWindow.webGL.shader.vertex = code;
      runGLCode();
    }
  };

  var updateFrag = function(code) {
    if(webglWindow) {
      log("update fragment shader");
      webglWindow.webGL.shader.fragment = code;
      runGLCode();
    }
  };

  var runGLCode = function(code) {
    code = code || appState.activeCode;
    if(!code || !isShaderLoaded()) {
      return;
    }
    try {
      log("run code");
      webglWindow.eval(code);
      webglWindow.webGL.run();
      appState.activeCode = code;
    }
    catch(error) {
      log(error, "error");
      // runGLCode(appState.activeCode);
    }
  };


  var isShaderLoaded = function() {
    var shader = webglWindow.webGL.shader;
    return shader.fragment && shader.vertex;
  };

  var log = function(message, level) {
    console.log(message);
    level = level || "info";
    appState.logs = appState.logs || [];
    appState.logs.push( {message: message, level: level} );
    renderLog();
  };

  var renderLog = function() {
    var $logs = $("#logs");
    $logs.empty();
    appState.logs.forEach(function(log) {
      $logs.append("<div class='"+log.level+"'>"+log.message+"</div>");
    });
  };

  var createAceEditor = function(cssId, mode, updateCallback) {
    var editor = ace.edit(cssId);
    editor.setTheme("ace/theme/chaos");
    editor.getSession().setMode("ace/mode/"+mode);
    editor.setShowPrintMargin(false);
    editor.setFontSize(16);
    editor.setKeyboardHandler("ace/keyboard/vim");

    editor.commands.addCommand({
      name: 'update',
      bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
      exec: function(editor) {
        updateCallback(editor.getValue());
      }
    });

    editor.clearSelection();
    return editor;
  };

});


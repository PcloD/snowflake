/** @jsx React.DOM */

// var component = require('omniscient'),
    // immstruct = require('immstruct');

var appState = {};

window.SnowflakeApp = React.createClass({

  // componentDidMount: function() {
  //   var webglFrame = this.refs.webglFrame;
  //   var that = this;
  //   webglFrame.onload = this.initWebGL.bind(this);
  // },
  initWebGL: function() {
    this.loadCode("triangles");
  },
  onChangeVert: function(code) {
   this.refs.webglFrame.setVertShader(code);
   this.refs.webglFrame.runGLCode();
  },

  onChangeFrag: function(code) {
   this.refs.webglFrame.setFragShader(code);
   this.refs.webglFrame.runGLCode();
  },

  onChangeJS: function(code) {
   this.refs.webglFrame.setJS(code);
   this.refs.webglFrame.runGLCode();
  },

  loadCode: function(name) {
    var shaderDir = "shaders";
    var jsDir = "js";
    console.log("loading "+name);
    var that = this;

    $.get(jsDir+"/"+name+".js", function(code) {
      that.onChangeJS(code);
      that.refs.jsEditor.setContent(code);
    }, "text");

    $.get(shaderDir+"/"+name+".vert", function(code) {
      that.refs.vertEditor.setContent(code);
      that.onChangeVert(code);
    }, "text");

    $.get(shaderDir+"/"+name+".frag", function(code) {
      that.onChangeFrag(code);
      that.refs.fragEditor.setContent(code);
    }, "text");

  },
  render: function() {
    return (
      <div id="app">
        <Editor
          id="editor_vert"
          updateCallback={this.onChangeVert}
          ref="vertEditor"
          mode="glsl">
        </Editor>
        <Editor
          id="editor_frag"
          updateCallback={this.onChangeFrag}
          ref="fragEditor"
          mode="glsl">
        </Editor>
        <Editor
          id="editor_js"
          updateCallback={this.onChangeJS}
          ref="jsEditor"
          mode="javascript">
        </Editor>
        <div id="logs"> </div>
        <WebGLFrame ref="webglFrame" onload={this.initWebGL}></WebGLFrame>
      </div>
    )
  }
});

var WebGLFrame = React.createClass({
  componentDidMount: function() {

    var iframe = this.getDOMNode();
    var that = this;

    iframe.onload = function() {
      that.webGLWindow= that.getDOMNode().contentWindow;
      that.webGLContext = that.webGLWindow.webGL;
      that.props.onload();
    };
  },
  setFragShader: function(code) {
    if(this.webGLContext) {
      this.webGLContext.setShader({fragment: code})
    }
    else {
      console.log("webGLContext not present")
    }
  },
  setVertShader: function(code) {
    if(this.webGLContext) {
      this.webGLContext.setShader({vertex: code})
    }
    else {
      console.log("webGLContext not present")
    }
  },
  setJS: function(code) {
    if(this.webGLContext) {
      appState.activeCode = code;
    }
    else {
      console.log("webGLContext not present");
    }
  },

  runGLCode: function() {
    code = appState.activeCode;
    if(!code) {
      console.log("no active code found!");
      return
    }
    try {
      console.log("run code");
      this.webGLWindow.eval(code);
      this.webGLContext.run();
    } catch(error) {
      console.log(error);
    }
  },
  render: function() {
    return(
      <iframe id="webglwindow" src="webgl_frame.html"></iframe>
    );
  }

});

var Editor = React.createClass({

  componentDidMount: function() {
    this.ace = this.initAceEditor();
  },

  initAceEditor: function() {

    var mode = this.props.mode;
    var editor = ace.edit(this.getDOMNode());
    editor.setTheme("ace/theme/chaos");
    editor.getSession().setMode("ace/mode/"+mode);
    editor.setShowPrintMargin(false);
    editor.setFontSize(16);
    editor.setKeyboardHandler("ace/keyboard/vim");

    var that = this;
    editor.commands.addCommand({
      name: 'update',
      bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
      exec: function(editor) {
        that.props.updateCallback(editor.getValue());
      }
    });

    editor.clearSelection();
    return editor;
  },

  setContent: function(content) {
    this.ace.setValue(content);
  },

  render: function() {
    return(
      <div id={this.props.id}> </div>
    )
  }
})

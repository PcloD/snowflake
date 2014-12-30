/** @jsx React.DOM */

var mui          = require('material-ui'),
    Toolbar      = mui.Toolbar,
    ToolbarGroup = mui.ToolbarGroup,
    DropDownMenu = mui.DropDownMenu;

window.SnowflakeApp = React.createClass({

  mixins: [Cursors],
  getInitialState: function() {
    return {
      flake_id: "",
      code: {
        vertexShader: "",
        fragmentShader: "",
        javascript: ""
      }
    }
  },

  initWebGL: function() {
    this.loadCode("triangles");
  },

  loadCode: function(name) {
    var shaderDir = "shaders";
    var jsDir = "js";
    console.log("loading "+name);
    var that = this;

    $.get(jsDir+"/"+name+".js", function(code) {
      that.update({code: {javascript: {$set: code}}});
    }, "text");

    $.get(shaderDir+"/"+name+".vert", function(code) {
      that.update({code: {vertexShader: {$set: code}}});
    }, "text");

    $.get(shaderDir+"/"+name+".frag", function(code) {
      that.update({code: {fragmentShader: {$set: code}}});
    }, "text");

  },
  menuItems: [
    {payload: "1", text: "Foo"},
    {payload: "2", text: "Hello"},
    {payload: "3", text: "World"},
    {payload: "4", text: "Bar"}
  ],
  render: function() {
    return (
      <div id="app">
        <div id="head">
          <Toolbar>
            <ToolbarGroup float="left">
              <DropDownMenu menuItems={this.menuItems}></DropDownMenu>
            </ToolbarGroup>
          </Toolbar>
        </div>
        <div id="content">
        <div className="wrapper">
          <Editor
            id="editor_vert"
            ref="vertEditor"
            cursors={{content: this.getCursor('code', 'vertexShader')}}
            mode="glsl">
          </Editor>
          <Editor
            id="editor_frag"
            ref="fragEditor"
            cursors={{content: this.getCursor('code', 'fragmentShader')}}
            mode="glsl">
          </Editor>
          <Editor
            id="editor_js"
            ref="jsEditor"
            cursors={{content: this.getCursor('code', 'javascript')}}
            mode="javascript">
          </Editor>
          <div id="logs"> </div>

          <WebGLFrame
            ref="webglFrame"
            cursors={{code: this.getCursor('code')}}
            onload={this.initWebGL}>

          </WebGLFrame>
        </div>
        </div>
      </div>
    )
  }
});

var WebGLFrame = React.createClass({
  mixins: [Cursors],
  componentDidMount: function() {

    var iframe = this.getDOMNode();
    var that = this;

    iframe.onload = function() {
      that.webGLWindow= that.getDOMNode().contentWindow;
      that.webGLContext = that.webGLWindow.webGL;
      that.props.onload();
    };
  },
  componentDidUpdate: function() {
    this.webGLContext.setShader({vertex: this.state.code.vertexShader})
    this.webGLContext.setShader({fragment: this.state.code.fragmentShader})
    this.runGLCode();
  },
  runGLCode: function() {
    code = this.state.code.javascript;

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

  mixins: [Cursors],
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
        that.update({content: {$set: editor.getValue()}});
      }
    });

    editor.clearSelection();
    editor.setValue(this.state.content, -1);
    return editor;
  },
  componentDidUpdate: function() {
    this.ace.setValue(this.state.content, -1);
  },
  render: function() {
    if(this.isMounted()) {
    }
    return(
      <div id={this.props.id}> </div>
    )
  }
});

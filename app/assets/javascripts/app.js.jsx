/** @jsx React.DOM */

var mui          = require('material-ui'),
    ToolbarGroup = mui.ToolbarGroup,
    DropDownMenu = mui.DropDownMenu;
    FlatButton   = mui.FlatButton;

window.SnowflakeApp = React.createClass({

  mixins: [Cursors],

  getInitialState: function() {
    this.getFlakesIndex();
    return {
      flakeId: null,
      code: {
        vertexShader: "",
        fragmentShader: "",
        javascript: ""
      },
      currentFocus: "top left",
      flakes: []
    }

  },
  initWebGL: function() {
    this.getFlakesIndex();
  },
  getFlakesIndex: function() {
    var url = "/flakes.json"
    var that = this;
    $.get(url, function(data) {
      that.update({flakes: {$set: data}});
    });
  },
  render: function() {
    return (
      <div id="app">
        <div id="head">
          <Toolbar cursors={{code: this.getCursor('code'), flakes: this.getCursor('flakes')}}>
          </Toolbar>
        </div>
        <div id="content">
          <div className="wrapper">
            <Editor
              id="editor_vert"
              position="top left"
              key="vertex_shader"
              cursors={{
                content: this.getCursor('code', 'vertexShader'),
                flakeId: this.getCursor("flakeId"),
                currentFocus: this.getCursor("currentFocus")
              }}
              mode="glsl">
            </Editor>
            <Editor
              id="editor_frag"
              position="bottom left"
              key="fragment_shader"
              cursors={{
                content: this.getCursor('code', 'fragmentShader'),
                flakeId: this.getCursor("flakeId"),
                currentFocus: this.getCursor("currentFocus")
              }}
              mode="glsl">
            </Editor>
            <Editor
              position="top right"
              id="editor_js"
              key="javascript"
              cursors={{
                content: this.getCursor('code', 'javascript'),
                flakeId: this.getCursor("flakeId"),
                currentFocus: this.getCursor("currentFocus")
              }}
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

var Toolbar = React.createClass({
  mixins: [Cursors],
  menuItems: function() {

    if(_.isEmpty(this.state.flakes)) {
      return;
    }
    var items = this.state.flakes.map(function(flake) {
      return {id: flake.id, text: flake.name};
    });
    return items;
  },
  onChange: function(e, selectedIndex, menuItem) {
    this.getFlake(menuItem.id);
  },
  getFlake: function(id) {
    var url = "/flakes/"+id+".json"
    var that = this;
    $.get(url, function(data) {
      that.loadFlake(data);
    });
  },
  loadFlake: function(data) {
    this.update({
      code: {
        javascript: {$set: data.javascript.code},
        fragmentShader: {$set: data.fragment_shader.code},
        vertexShader: {$set: data.vertex_shader.code}
      },
      flakeId: {$set: data.id}
    });
  },
  createNew: function() {
    var url = "/flakes/"+id+".json"
    var that = this;
    $.get(url, function(data) {
      that.loadFlake(data);
    });
  },
  render: function() {
    if(this.menuItems())
      return(<mui.Toolbar>
        <ToolbarGroup float="left">
          <DropDownMenu menuItems={this.menuItems()} onChange={this.onChange}/>
        </ToolbarGroup>
        <ToolbarGroup float="right">
        <FlatButton
          label="New"
          secondary={true}
          onClick={this.createNew}
        />
        </ToolbarGroup>
      </mui.Toolbar>
      )
    else
      return <div></div>
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
      // <div id="webglwindow"></div>
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
        that.onSave(editor.getValue());
      }
    });

    editor.commands.addCommand({
      name: 'focusDown',
      bindKey: {win: 'Ctrl-J',  mac: 'Command-J'},
      exec: function(editor) {
        that.switchFocus("down");
      }
    });

    editor.commands.addCommand({
      name: 'focusUp',
      bindKey: {win: 'Ctrl-K',  mac: 'Command-K'},
      exec: function(editor) {
        that.switchFocus("up");
      }
    });

    editor.commands.addCommand({
      name: 'focusLeft',
      bindKey: {win: 'Ctrl-H',  mac: 'Command-H'},
      exec: function(editor) {
        that.switchFocus("left");
      }
    });

    editor.commands.addCommand({
      name: 'focusRight',
      bindKey: {win: 'Ctrl-L',  mac: 'Command-L'},
      exec: function(editor) {
        that.switchFocus("right");
      }
    });

    editor.clearSelection();
    editor.setValue(this.state.content, -1);
    return editor;
  },
  switchFocus: function(direction) {
    var toggleMap = {
      "bottom": "top",
      "top": "bottom",
      "left": "right",
      "right": "left"
    };
    var currentFocus = this.state.currentFocus;
    var positions = currentFocus.split(" ");
    var currentVert, newVert, currentHor, newHor;
    currentVert = newVert = positions[0];
    currentHor = newHor = positions[1];

    if(_.contains(["up", "down"], direction)){
      newVert = toggleMap[currentVert];
    }

    if(_.contains(["left", "right"], direction)) {
      newHor = toggleMap[currentHor];
    }
    var newFocus = [newVert, newHor].join(" ");
    console.log("change focus from "+currentFocus+" to "+newFocus);
    this.update({currentFocus: {$set: newFocus}});
  },
  onSave: function(content) {
    this.update({content: {$set: content}});
    this.saveToServer(content);
  },
  saveToServer: function(content) {
    var url = "flakes.json";
    var key = this.props.key;
    var data = {id: this.props.flakeId, _method: "put"};
    data[key] = content;

    $.post(url, {data: data});
  },
  componentDidUpdate: function(prevProps, prevState) {
    if(this.props.position == this.state.currentFocus) {
      this.ace.focus();
    }
    if(this.state.content !== prevState.content) {
      this.ace.setValue(this.state.content, -1);
    }
  },
  render: function() {
    if(this.isMounted()) {
    }
    return(
      <div id={this.props.id}> </div>
    )
  }
});

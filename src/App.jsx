import React from "react";
import axios from "axios";
import { Base64 } from "js-base64";
import styled from "styled-components";
import { get } from "lodash";
import cx from "classnames";
// 引入编辑器组件
import BraftEditor from "braft-editor";
// 引入编辑器样式
import "braft-editor/dist/index.css";
import "./App.css";

const AppWrap = styled.div`
  height: 100%;
  border: 1px solid #eee;
  .previewWrap {
    overflow: auto;
    height: 100%;
  }
  .previewContent {
    padding: 20px 0;
  }
  .braftEditorWrap {
    overflow: hidden;
    box-sizing: border-box;
  }
  .bf-content {
    height: 100%;
  }
`;

const token =
  "QCLMePM7TGMVvirxL32Y9696IlLrdz4OsGRlRoWB:1IzZc2hY-HwEv8RmqBC0wdIu2EU=:eyJzY29wZSI6Im1kcGljIiwicmV0dXJuQm9keSI6IntcImtleVwiOlwiJChrZXkpXCIsXCJldGFnXCI6XCIkKGV0YWcpXCIsXCJidWNrZXRcIjpcIiQoYnVja2V0KVwiLFwiZnNpemVcIjpcIiQoZnNpemUpXCIsXCJzZXJ2ZXJOYW1lXCI6XCIkKHg6c2VydmVyTmFtZSlcIixcImZpbGVQYXRoXCI6XCIkKHg6ZmlsZVBhdGgpXCIsXCJmaWxlTmFtZVwiOlwiJCh4OmZpbGVOYW1lKVwiLFwib3JpZ2luYWxGaWxlTmFtZVwiOlwiJCh4Om9yaWdpbmFsRmlsZU5hbWUpXCIsXCJmaWxlRXh0XCI6XCIkKHg6ZmlsZUV4dClcIn0iLCJkZWFkbGluZSI6MTU3MzQwMTU5OSwiaW5zZXJ0T25seSI6MCwiZGV0ZWN0TWltZSI6MCwiZnNpemVMaW1pdCI6MH0=";

export default class EditorDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // 创建一个空的editorState作为初始值
      editorState: BraftEditor.createEditorState(null),
      token: "",
      preview: true
    };
    window.getTokenAndHtml = (token, base64) => {
      this.setState({
        editorState: BraftEditor.createEditorState(Base64.decode(base64)),
        token
      });
    };
    window.switchPreview = str => {
      this.setState({ preview: str === "true" ? true : false });
    };
  }
  componentDidMount() {
    const $editor = document.querySelector(".braftEditorWrap ");
    const $control = document.querySelector(".bf-controlbar");
    if ($editor && $control) {
      $editor.style.paddingBottom = $control.offsetHeight + 10 + "px";
    }
  }

  randomStr = () =>
    Math.random()
      .toString(16)
      .slice(2);

  uploadFile = ({ file, error, progress, success }) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener("load", data => {
      const result = get(data, ["target", "result"]);
      const type = file.type.split("/")[1];
      const key = Base64.encode(`upload/${this.randomStr()}.${type}`);
      const url = `https://upload.qiniup.com/putb64/-1/key/${key}`;
      axios
        .post(url, result.split(",")[1], {
          headers: {
            "Content-Type": "application/octet-stream",
            Authorization: `UpToken ${this.state.token || token}`
          },
          onUploadProgress: function(data) {
            progress && progress((data.loaded / data.total) * 100);
          }
        })
        .then(({ data }) => {
          const { key = "" } = data || {};
          const url = `https://pic.mingdao.com/${key}`;
          success({ url });
        })
        .catch(err => {
          error(err);
        });
    });
  };

  handleEditorChange = editorState => {
    this.setState({ editorState });
    window.richTextHtml = editorState.toHTML();
  };

  render() {
    const controls = [
      "headings",
      "text-color",
      "bold",
      "italic",
      "underline",
      "strike-through",
      "separator",
      "list-ul",
      "list-ol",
      { key: "media", title: "添加图片", text: "添加图片" },
      "separator",
      "undo",
      "redo"
    ];
    const { editorState, preview } = this.state;
    return (
      <AppWrap className={cx("App", "preview")}>
        {preview ? (
          <div className="previewWrap">
            <div
              className="previewContent"
              dangerouslySetInnerHTML={{ __html: editorState.toHTML() }}
            ></div>
          </div>
        ) : (
          <BraftEditor
            className="braftEditorWrap"
            media={{
              accepts: { video: false, audio: false, image: true },
              externals: {
                video: false,
                audio: false,
                image: true,
                embed: false
              },
              uploadFn: this.uploadFile
            }}
            controls={controls}
            value={editorState}
            onChange={this.handleEditorChange}
            onSave={this.submitContent}
          />
        )}
      </AppWrap>
    );
  }
}

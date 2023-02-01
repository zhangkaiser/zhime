import { LitElement, html, css, PropertyValueMap, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import Editor, { EditorType, PreviewStyle } from '@toast-ui/editor';

import styles from "@toast-ui/editor/dist/toastui-editor.css";
import { getTempStrArr } from "src/utils/template-strings-array";

@customElement("tui-editor")
export class TuiEditor extends LitElement {
  constructor() {
    super();
  }
  editor!: Editor;

  @property({}) height = '90vh';
  @property() minheight = '200px';
  @property() initialValue = "";
  @property() previewStyle: PreviewStyle = "tab";
  @property() previewHighlight = true;
  @property() initialEditType: EditorType = "markdown";

  static styles = css(getTempStrArr([styles]));

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this.editor = new Editor({
      el: this.editorElement,
      height: this.height,
      initialEditType: this.initialEditType,
      previewStyle: this.previewStyle,
      usageStatistics: true
    });
  }

  get editorElement() {
    return this.shadowRoot!.getElementById("editor")!;
  }

  render() {
    return html`<div id="editor"></div>`;
  }
}


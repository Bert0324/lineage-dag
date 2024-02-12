"use strict";

import { Edge } from "butterfly-dag";
import $ from "jquery";

import calcPath from "./calc_path";
import { setDragedPosition } from "../../example/utils/drag";

export default class MEdge extends Edge {
  constructor(opts) {
    super(opts);
  }
  mounted() {
    if (this.options.relationColor && this.dom) {
      this.dom.style.stroke = this.options.relationColor;
    }
    // console.log(this);
    if (!this.sourceNode.options.isCollapse) {
      $(this.sourceEndpoint.dom).removeClass("hidden");
    }
    if (!this.targetNode.options.isCollapse) {
      $(this.targetEndpoint.dom).removeClass("hidden");
    }
  }
  calcPath(sourcePoint, targetPoint) {
    setDragedPosition(
      this.sourceNode.dom,
      this.sourceEndpoint.dom,
      sourcePoint
    );
    setDragedPosition(
      this.targetNode.dom,
      this.targetEndpoint.dom,
      targetPoint
    );
    return calcPath(sourcePoint, targetPoint);
  }
  focusChain(addClass = "hover-chain") {
    $(this.dom).addClass(addClass);
    $(this.arrowDom).addClass(addClass);
    $(this.labelDom).addClass(addClass);
    this.setZIndex(1000);
  }

  unfocusChain(rmClass = "hover-chain") {
    $(this.dom).removeClass(rmClass);
    $(this.arrowDom).removeClass(rmClass);
    $(this.labelDom).removeClass(rmClass);
    this.setZIndex(0);
  }
  destroy(isNotEventEmit) {
    super.destroy(isNotEventEmit);
    if (!this.sourceNode.options.isCollapse) {
      $(this.sourceEndpoint.dom).addClass("hidden");
    }
    if (!this.targetNode.options.isCollapse) {
      $(this.targetEndpoint.dom).addClass("hidden");
    }
  }
}

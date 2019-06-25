import $ from "jquery";
import "ui/button";
import "ui/button_group";
import devices from "core/devices";
import eventsEngine from "events/core/events_engine";
import keyboardMock from "../../helpers/keyboardMock.js";
import pointerMock from "../../helpers/pointerMock.js";
import registerKeyHandlerTestHelper from '../../helpers/registerKeyHandlerTestHelper.js';
import "common.css!";

const BUTTON_CLASS = "dx-button",
    BUTTON_GROUP_CLASS = "dx-buttongroup",
    BUTTON_GROUP_ITEM_CLASS = BUTTON_GROUP_CLASS + "-item",
    BUTTON_GROUP_ITEM_HAS_WIDTH = BUTTON_GROUP_CLASS + "-item-has-width";

QUnit.testStart(() => {
    const markup = `
        <div id="buttonGroup"></div>
        <div id="widget"></div>
    `;
    $("#qunit-fixture").html(markup);
});

QUnit.module("option changed", {
    createButtonGroup(options) {
        options = options || {
            items: [{ text: "button 1" }, { text: "button 2" }]
        };
        return $("#buttonGroup").dxButtonGroup(options).dxButtonGroup("instance");
    },
    beforeEach() {
        this.buttonGroup = this.createButtonGroup();
        this.$buttonGroup = this.buttonGroup.$element();
    }
}, () => {
    QUnit.test("change hover state for all buttons", function(assert) {
        this.buttonGroup.option("hoverStateEnabled", false);
        const buttons = $(`.${BUTTON_CLASS}`).map((_, $button) => $($button).dxButton("instance"));

        assert.equal(buttons[0].option("hoverStateEnabled"), false, "first button");
        assert.equal(buttons[1].option("hoverStateEnabled"), false, "second button");
    });

    QUnit.test("change hover state for all buttons", function(assert) {
        this.buttonGroup.option("focusStateEnabled", false);
        const buttons = $(`.${BUTTON_CLASS}`).map((_, $button) => $($button).dxButton("instance"));

        assert.equal(buttons[0].option("focusStateEnabled"), false, "first button");
        assert.equal(buttons[1].option("focusStateEnabled"), false, "second button");
    });

    QUnit.test("change active state for all buttons", function(assert) {
        this.buttonGroup.option("activeStateEnabled", true);
        const buttons = $(`.${BUTTON_CLASS}`).map((_, $button) => $($button).dxButton("instance"));

        assert.equal(buttons[0].option("activeStateEnabled"), true, "first button");
        assert.equal(buttons[1].option("activeStateEnabled"), true, "second button");
    });

    QUnit.test("change items", function(assert) {
        this.buttonGroup.option("items", [{
            text: "left"
        }, {
            text: "right"
        }]);

        const buttons = $(`.${BUTTON_CLASS}`).map((_, $button) => $($button).dxButton("instance"));
        assert.equal(buttons[0].option("text"), "left", "text of first button");
        assert.equal(buttons[1].option("text"), "right", "text of second button");
    });

    QUnit.test("change the width option", function(assert) {
        this.buttonGroup.option("width", 500);

        const buttonsSelector = `.${BUTTON_CLASS}`;
        let buttons = $(buttonsSelector);

        assert.equal(this.$buttonGroup.width(), 500, "button group width");
        assert.ok(buttons.eq(0).hasClass(BUTTON_GROUP_ITEM_HAS_WIDTH), "first item when button group has width");
        assert.ok(buttons.eq(1).hasClass(BUTTON_GROUP_ITEM_HAS_WIDTH), "second item when button group has width");
    });

    QUnit.test("change the width option when item has template", function(assert) {
        const buttonGroup = this.createButtonGroup({
            items: [{ text: "button 1" }, { text: "button 2" }],
            itemTemplate: () => "<div/>",
        });

        buttonGroup.option("width", 500);

        let $items = $(`.${BUTTON_GROUP_ITEM_CLASS}`);
        assert.equal(buttonGroup.$element().width(), 500, "button group width");
        assert.ok($items.eq(0).hasClass(BUTTON_GROUP_ITEM_HAS_WIDTH), "first item when button group has width");
        assert.ok($items.eq(1).hasClass(BUTTON_GROUP_ITEM_HAS_WIDTH), "second item when button group has width");
    });

    QUnit.test("it should be possible to set full set of options for each button", assert => {
        const $element = $("#widget").dxButtonGroup({
            items: [{ text: "button 1", width: 24, elementAttr: { class: "test" }, customOption: "Test option" }]
        });
        const buttonsSelector = `.${BUTTON_CLASS}`;
        let button = $element.find(buttonsSelector).eq(0).dxButton("instance");

        assert.strictEqual(button.option("width"), 24, "width is correct");
        assert.ok(button.$element().hasClass("test"), "elementAttr is correct");
        assert.strictEqual(button.option("customOption"), "Test option", "all options should be passed to the button");
    });

    QUnit.test("default options should not be redefined", assert => {
        const $element = $("#widget").dxButtonGroup({
            items: [{ text: "Test", focusStateEnabled: true }]
        });
        const buttonsSelector = `.${BUTTON_CLASS}`;
        const button = $element.find(buttonsSelector).eq(0).dxButton("instance");

        assert.strictEqual(button.option("focusStateEnabled"), false, "focusStateEnabled has not been redefined");
    });

    QUnit.test("onClick can be redefined", assert => {
        const handler = sinon.spy();
        const $element = $("#widget").dxButtonGroup({
            items: [{ text: "Test", onClick: handler }]
        });
        const buttonsSelector = `.${BUTTON_CLASS}`;
        const button = $element.find(buttonsSelector).eq(0);

        eventsEngine.trigger(button, "dxclick");
        assert.strictEqual(handler.callCount, 1, "handler has been called");
    });

    QUnit.test("change the stylingMode option", function(assert) {
        this.buttonGroup.option("stylingMode", "text");

        const buttons = $(`.${BUTTON_CLASS}`).map((_, $button) => $($button).dxButton("instance"));

        assert.equal(buttons[0].option("stylingMode"), "text", "first button");
        assert.equal(buttons[1].option("stylingMode"), "text", "second button");
    });
});


QUnit.module("Events", () => {
    class ButtonGroupEventsTestHelper {
        constructor(eventName, isItemClickInInitialOption, isDisabled, isItemDisabled) {
            this.handler = sinon.spy();
            this.eventName = eventName;
            this.isItemClickInInitialOption = isItemClickInInitialOption;
            this.isDisabled = isDisabled;
            this.isItemDisabled = isItemDisabled;
            this.isKeyboardEvent = this.eventName === "space" || this.eventName === "enter";
        }

        createButtonGroup() {
            if(this.isItemClickInInitialOption) {
                this.buttonGroup = $("#widget").dxButtonGroup({
                    items: [{ text: "item1", disabled: this.isItemDisabled, custom: 1 }],
                    disabled: this.isDisabled,
                    onItemClick: this.handler
                }).dxButtonGroup("instance");
            } else {
                this.buttonGroup = $("#widget").dxButtonGroup({
                    items: [{ text: "item1", disabled: this.isItemDisabled, custom: 1 }],
                    disabled: this.isDisabled
                }).dxButtonGroup("instance");

                this.buttonGroup.option("onItemClick", this.handler);
            }
        }

        _getButtonGroupItem() {
            return this.buttonGroup.$element().find(`.${BUTTON_GROUP_ITEM_CLASS}`).eq(0);
        }

        performAction() {
            if(this.eventName === "click") {
                eventsEngine.trigger(this._getButtonGroupItem(0), "dxclick");
            } else if(this.eventName === "touch") {
                pointerMock(this._getButtonGroupItem(0))
                    .start("touch")
                    .down()
                    .up();
            } else {
                if(!this.isDisabled) keyboardMock(this.buttonGroup.$element()).press(this.eventName);
            }
        }

        checkAsserts(assert) {
            if((this.isDisabled || this.isItemDisabled)) {
                assert.equal(this.handler.callCount, 0, "handler.callCount");
            } else {
                assert.strictEqual(this.handler.callCount, 1, "handler.callCount");

                const e = this.handler.getCall(0).args[0];
                assert.strictEqual(Object.keys(e).length, 6, "Object.keys(e).length");
                assert.strictEqual(e.component, this.buttonGroup, "e.component");
                assert.strictEqual(e.element, this.buttonGroup.element(), "element is correct");
                assert.strictEqual(e.event.type, this.isKeyboardEvent ? "keydown" : "dxclick", "e.event.type");
                assert.deepEqual(e.itemData, { text: `item1`, disabled: this.isItemDisabled, custom: 1 }, "e.itemData");
                assert.strictEqual(e.itemIndex, 0, "e.itemIndex");
                assert.strictEqual($(e.itemElement).get(0), this._getButtonGroupItem(0).get(0), `$(e.itemElement).get(0)`);
            }
        }
    }

    [true, false].forEach((isDisabled) => {
        [true, false].forEach((isItemDisabled) => {
            [true, false].forEach((isItemClickInInitialOption) => {
                ["click", "touch", "space", "enter"].forEach((eventName) => {
                    let config = ` ${eventName}, onItemClick is initial option=${isItemClickInInitialOption}, disabled: ${isDisabled} ${isItemDisabled ? `, item.disabled=${isItemDisabled}` : ``}`;

                    QUnit.test("Check onItemClick for" + config, (assert) => {
                        let helper = new ButtonGroupEventsTestHelper(eventName, isItemClickInInitialOption, isDisabled, isItemDisabled);
                        helper.createButtonGroup();
                        helper.performAction();
                        helper.checkAsserts(assert);
                    });
                });
            });
        });
    });
});

if(devices.current().deviceType === "desktop") {
    registerKeyHandlerTestHelper.runTests(QUnit, "dxButtonGroup");
}
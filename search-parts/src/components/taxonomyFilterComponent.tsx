import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  BaseWebComponent,
  ExtensibilityConstants,
  IDataFilterInfo,
} from "@pnp/modern-search-extensibility";
import { IReadonlyTheme } from "@microsoft/sp-component-base";
import {
  TreeView,
  ITreeItem,
  TreeViewSelectionMode,
  SelectChildrenMode,
  TreeItemActionsDisplayMode,
} from "@pnp/spfx-controls-react/lib/TreeView";
import PropertyPaneWebPartInformationHost from "@pnp/spfx-property-controls/lib/propertyFields/webPartInformation/PropertyPaneWebPartInformationHost";

export interface ITaxonomyFilterComponentProps {
  filter?: any;
  config?: any[];
  themeVariant?: IReadonlyTheme;
  onfilterChange: (selectedFilter) => void;
}

export class TaxonomyFilterComponent extends React.Component<
  ITaxonomyFilterComponentProps,
  {}
> {
  public constructor(props: ITaxonomyFilterComponentProps) {
    super(props);
  }
  public addChildren(
    treeItem: ITreeItem,
    unusedItems: ITreeItem[],
    depth: number
  ) {
    if (unusedItems.length === 0) {
      return;
    }
    let allChildItems = unusedItems.filter((x) =>
      x.label.startsWith(treeItem.label)
    );
    let imidiateChildItems = allChildItems.filter(
      (x) => x.label.split(":").length === depth
    );
    treeItem.children = imidiateChildItems;
    let allUnusedChildItems = allChildItems.filter(
      (x) => x.label.split(":").length !== depth
    );
    treeItem.children.forEach((x) =>
      this.addChildren(x, allUnusedChildItems, ++depth)
    );
  }
  public render() {
    let data = this.props.filter.values.map((x) => {
      return { key: x.value, label: x.name, data: x };
    });
    let treeItems = data.filter((x) => x.label.split(":").length === 1);
    data = data.filter((x) => x.label.split(":").length !== 1);
    if (treeItems) {
      treeItems.forEach((x) => this.addChildren(x, data, 2));

      console.log(treeItems, 0, 4);
    }

    return (
      <TreeView
        items={treeItems ? treeItems : []}
        defaultExpanded={false}
        selectionMode={TreeViewSelectionMode.Multiple}
        selectChildrenMode={
          SelectChildrenMode.Select | SelectChildrenMode.Unselect
        }
        showCheckboxes={true}
        treeItemActionsDisplayMode={TreeItemActionsDisplayMode.ContextualMenu}
        defaultSelectedKeys={["key1", "key2"]}
        expandToSelected={true}
        defaultExpandedChildren={true}
        onSelect={(items) => {
          this.props.onfilterChange(items);
        }}
      />
    );
  }
}

export class TaxonomyFilterWebComponent extends BaseWebComponent {
  constructor() {
    super();
  }

  public connectedCallback() {
    let props = this.resolveAttributes();

    const fileResultItem = (
      <TaxonomyFilterComponent
        {...props}
        onfilterChange={(selectedFIlter) => {
          // Bubble event through the DOM
          this.dispatchEvent(
            new CustomEvent(ExtensibilityConstants.EVENT_FILTER_UPDATED, {
              detail: {
                filterName: props.filter.filterName,
                filterValues: selectedFIlter
                  .filter((x) => x.selected)
                  .map((x) => {
                    let data = x.data;
                    data.selected = true;
                    return data;
                  }),
                instanceId: props.instanceId,
              } as IDataFilterInfo,
              bubbles: true,
              cancelable: true,
            })
          );
        }}
      />
    );
    ReactDOM.render(fileResultItem, this);
  }
}

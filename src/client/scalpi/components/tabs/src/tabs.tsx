/* eslint-disable no-use-before-define */
import type { ForwardedRef, ReactElement } from 'react';

import { useId } from 'react';
import { LayoutGroup } from 'framer-motion';
import { forwardRef } from '@heroui/system';
import type { UseTabsProps } from './use-tabs';

import { useTabs } from './use-tabs';
import Tab from './tab';
import TabPanel from './tab-panel';

interface Props<T> extends UseTabsProps<T> {}

export type TabsProps<T extends object = object> = Props<T>;

const TabsNew = forwardRef(function Tabs<T extends object>(
  props: TabsProps<T>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const {
    Component,
    values,
    state,
    domRef,
    destroyInactiveTabPanel,
    getBaseProps,
    getTabListProps,
    getWrapperProps,
  } = useTabs<T>({
    ...props,
    ref,
  });

  const layoutId = useId();

  const isInModal = domRef?.current?.closest('[aria-modal="true"]') !== null;

  const layoutGroupEnabled =
    !props.disableAnimation && !props.disableCursorAnimation && !isInModal;

  const tabsProps = {
    state,
    listRef: values.listRef,
    slots: values.slots,
    classNames: values.classNames,
    isDisabled: values.isDisabled,
    motionProps: values.motionProps,
    disableAnimation: values.disableAnimation,
    shouldSelectOnPressUp: values.shouldSelectOnPressUp,
    disableCursorAnimation: values.disableCursorAnimation,
  };

  const tabs = [...state.collection].map((item) => (
    <Tab key={item.key} item={item} {...tabsProps} {...item.props} />
  ));

  const renderTabs = (
    <>
      <div {...getBaseProps()}>
        <Component {...getTabListProps()}>
          {layoutGroupEnabled ? (
            <LayoutGroup id={layoutId}>{tabs}</LayoutGroup>
          ) : (
            tabs
          )}
        </Component>
      </div>

      {/* Панели в линию + translateX */}
      <div className="relative flex h-full max-h-full flex-1 overflow-hidden">
        <div
          className="flex h-full w-full transition-transform duration-300"
          style={{
            transform: `translateX(-${
              [...state.collection].findIndex(
                (i) => i.key === state.selectedKey
              ) * 100
            }%)`,
          }}
        >
          {[...state.collection].map((item) => {
            const isActive = item.key === state.selectedKey;

            return (
              <div
                aria-hidden={!isActive}
                key={item.key}
                className={`h-full w-full shrink-0 ${
                  isActive ? '' : 'pointer-events-none touch-none select-none'
                }`}
              >
                <TabPanel
                  classNames={values.classNames}
                  destroyInactiveTabPanel={destroyInactiveTabPanel}
                  slots={values.slots}
                  state={values.state}
                  tabKey={item.key}
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );

  if ('placement' in props || 'isVertical' in props) {
    return <div {...getWrapperProps()}>{renderTabs}</div>;
  }

  return renderTabs;
}) as <T extends object>(props: TabsProps<T>) => ReactElement;

export default TabsNew;

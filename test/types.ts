import { h } from 'vue';
import { IconArrowDown, type IconName, type IconProps } from 'siri-icons-vue';
import ArrowDown from 'siri-icons-vue/icons/arrow-down';

const name: IconName = 'arrow-down';
const props: IconProps = {
  size: '1.5em',
  color: 'rebeccapurple',
  title: 'Go down',
  class: ['icon', { active: true }],
  style: { marginInlineEnd: '0.25rem' },
  'aria-label': 'Down',
  onClick: (event: MouseEvent) => event.preventDefault(),
};
h(IconArrowDown, props);
h(ArrowDown, { size: 16, 'aria-hidden': true });
void name;

// @ts-expect-error Unknown icon names must not pass the catalog type.
const unknownName: IconName = 'not-an-icon';
// @ts-expect-error Objects are not valid icon dimensions.
const invalid: IconProps = { size: {} };
void unknownName;
void invalid;

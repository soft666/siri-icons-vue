import { h } from 'vue';
import { IconArrowDown, type IconName, type IconProps } from 'siri-icons-vue';
import ArrowDown from 'siri-icons-vue/icons/arrow-down';
import { IllustrationEmptyFolder, type IllustrationName, type IllustrationProps } from 'siri-icons-vue';
import EmptyFolder from 'siri-icons-vue/illustrations/empty-folder';

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

const illustrationName: IllustrationName = 'empty-folder';
const illustrationProps: IllustrationProps = { size: 160, title: 'Empty' };
h(IllustrationEmptyFolder, illustrationProps);
h(EmptyFolder, {size:120});
void illustrationName;

import { DoodleEmptyFolder, type DoodleName, type DoodleProps } from 'siri-icons-vue';
import EmptyDoodle from 'siri-icons-vue/doodles/empty-folder';
const doodleName: DoodleName = 'empty-folder';
const doodleProps: DoodleProps = {size:144,title:'Empty folder'};
h(DoodleEmptyFolder,doodleProps);
h(EmptyDoodle,{size:288});
void doodleName;

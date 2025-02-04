/* eslint-disable @typescript-eslint/no-explicit-any */
import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { provideValidatorErrorsService } from '../../../services';
import { StorybookNativeSelectComponent } from './components';
import CustomMDXDocumentation from './native-select.docs.mdx';

export default {
  title: 'Components/Forms/Select',
  component: StorybookNativeSelectComponent,
  decorators: [
    moduleMetadata({
      providers: [provideValidatorErrorsService()],
    }),
  ],
  parameters: {
    docs: {
      page: CustomMDXDocumentation,
    },
  },
} as Meta<StorybookNativeSelectComponent>;

const Template: Story<StorybookNativeSelectComponent> = (args) => ({
  props: args,
});

export const Native = Template.bind({});

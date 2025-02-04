/* eslint-disable @typescript-eslint/no-explicit-any */
import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { provideValidatorErrorsService } from '../../../services';
import { StorybookTextInputComponent } from './components';
import CustomMDXDocumentation from './text-input.docs.mdx';

export default {
  title: 'Components/Forms/Input',
  component: StorybookTextInputComponent,
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
} as Meta<StorybookTextInputComponent>;

const Template: Story<StorybookTextInputComponent> = (args) => ({
  props: args,
});

export const Text = Template.bind({});

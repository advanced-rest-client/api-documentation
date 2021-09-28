import { LitElement, TemplateResult } from 'lit-element';
import { AmfHelperMixin, DomainElement, ApiDomainProperty, ApiCustomDomainProperty, ApiScalarNode, ApiObjectNode } from '@api-components/amf-helper-mixin';

export const shapeValue: unique symbol;
export const processShape: unique symbol;
export const propertiesValue: unique symbol;
export const propertyTemplate: unique symbol;
export const processVisibility: unique symbol;
export const scalarValue: unique symbol;
export const annotationWrapperTemplate: unique symbol;
export const scalarTemplate: unique symbol;
export const objectTemplate: unique symbol;
export const objectScalarPropertyTemplate: unique symbol;

/**
 * An element to render annotations (also known as custom properties)
 * from AMF model.
 *
 * Annotations are part of RAML language and API console supports it.
 * The element looks for annotations in model and renders them.
 */
export default class ApiAnnotationDocumentElement extends AmfHelperMixin(LitElement) {
  /**
   * A domain property that may have custom domain properties
   */
  shape: DomainElement;
  /**
   * Serialized with `ApiSerializer` API domain model.
   * This is to be used instead of `shape`.
   */
  domainModel: ApiDomainProperty;
  /**
   * Computed value, true if any custom property has been found.
   */
  get hasCustomProperties(): boolean;

  /**
   * List of custom properties in the shape.
   */
  get customProperties(): ApiCustomDomainProperty[] | undefined;
  /**
   * List of custom properties in the shape.
   */
  set customProperties(value: ApiCustomDomainProperty[]);

  /**
   * Called when the shape property change.
   * Sets `hasCustomProperties` and `customList` properties.
   *
   * Note that for performance reasons, if the element determine that there's
   * no custom properties wit will not clear `customList`.
   * It will be updated only if the value actually change.
   */
  [processShape](): void;

  [processVisibility](): void;

  [scalarValue](scalar: ApiScalarNode): any;

  render(): TemplateResult;

  /**
   * @returns The template for the custom property.
   */
  [propertyTemplate](property: ApiCustomDomainProperty): TemplateResult | string;

  /**
   * @param name The annotation name
   * @param content The content tp render.
   * @returns The template for the custom property.
   */
  [annotationWrapperTemplate](name: string, content: unknown): TemplateResult;
  /**
   * @returns The template for the custom property.
   */
  [scalarTemplate](name: string, scalar: ApiScalarNode): TemplateResult;
  /**
   * @returns The template for the custom property.
   */
  [objectTemplate](name: string, object: ApiObjectNode): TemplateResult;
  /**
   * @returns The template for the custom property.
   */
  [objectScalarPropertyTemplate](name: string, scalar: ApiScalarNode): TemplateResult;
}

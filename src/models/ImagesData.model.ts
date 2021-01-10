/**
 * Interface for manage images data on the system.
 */
export interface ImagesData {
  // Send image name on the front is not a good idea, 'cause the user
  // can to access to name by network transit data or page DOM.
  // Solution is to use uuid for identify image on the front and
  // associate this uuid to image path and send image data without item name.

  /**
   * Map of images from games resources.
   * `Key` is image uuid,
   * `Value` is image path.
   */
  imagesData: Map<string, string>;
}

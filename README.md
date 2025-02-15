# 🎥 Recorder

Welcome to Recorder, a fork of the original Recorder project that adds MP4 conversion support! This web application lets you capture your screen and camera right in your browser, with the added ability to convert recordings to MP4 format. No downloads or installations needed – just head over to [record.addy.ie](https://record.addy.ie), and start your recording! 🚀

<a align="center" href="https://record.addy.ie">
  <img alt="" src="screenshots/main-window.png" width="49%"/>
  <img alt="" src="screenshots/recording.png" width="49%"/>
</a>

## Features

- ✨ **Simple and Intuitive:** Recorder offers a user-friendly interface, making recording a breeze for everyone.
- 🎥 **Screen and Camera Recording:** Capture your browser tab or window while simultaneously adding a personal touch with your webcam.
- 🖼️ **Picture-in-Picture View:** Experience the magic of picture-in-picture, see yourself while you're recording your screen.
- 🔄 **Customizable Camera Shape:** Choose between a circular or square camera view that persists in both preview and final recording.
- 🔒 **Local and Secure:** Privacy should always be a top priority! All recordings take place directly in your browser so whatever you record, only you'll have access to it.
- 🎬 **Real-time Preview:** Preview your camera and screen recording in real-time before diving into the action.
- 🔄 **MP4 Conversion:** Convert your recordings from WEBM to MP4 format using FFMPEG.wasm, right in your browser!

## How to Use

1. **Access the Web Application:** Fire up your Google Chrome browser and head to [record.addy.ie](https://record.addy.ie).

2. **Choose Your Mode:** Select your desired recording mode:

   - 🖥️ **Screen only:** Capture your browser tab or window without the camera.
   - 🎥 **Screen and camera:** Record your browser tab or window along with your awesome camera.
   - 📷 **Camera only:** Focus solely on your camera for a personal touch.

3. **Customize Camera Shape:** Select your preferred camera shape (square or circle) using the shape toggle in the footer.

4. **Start Recording:** Click the big red "Record" button to kickstart your screen and camera recording adventure.

5. **Picture-in-Picture View:** Your camera will appear in a nifty picture-in-picture view while recording the screen.

6. **Save and Convert:** When you're done, click the "Stop" button and choose to either:
   - Download directly as WEBM
   - Convert to MP4 using FFMPEG.wasm before downloading

## Browser Compatibility

Recorder only works with **Google Chrome**! It leverages certain browser capabilities that may not be available in other browsers at the moment.

## Support

If you encounter any issues, have questions, or need assistance, please feel free to [open an issue](https://github.com/addyosmani/recorder/issues) on GitHub. We welcome your feedback and are happy to assist with any questions or concerns you may have.

## Development & Contributions

Excited to dive into the code and make this app even cooler? To get started, follow these steps:

1. **Clone the Repository:** Fork the Recorder repository and clone it to your local machine using Git.

   ```bash
   git clone https://github.com/addyosmani/recorder.git
   ```

2. **Navigate to the Directory:** Move into the Recorder project directory.

   ```bash
   cd recorder
   ```

3. **Install Dependencies:** Install the necessary dependencies using Yarn.

   ```bash
   yarn
   ```

4. **Run the Development Server:** Start the development server with Yarn.

   ```bash
   yarn dev
   ```

5. **Make Your Changes:** Work your magic! Make the desired improvements, add features, or fix issues.

6. **Create a Pull Request:** Once you're happy with your changes, create a pull request on the main Recorder repository. We'll review your contribution and merge it if everything looks good!

## Credits

This project is a fork of the original [Recorder](https://github.com/contrastio/recorder) by [Contrast](https://getcontrast.io). The original project provided the foundation for screen and camera recording functionality. This fork adds MP4 conversion support using [FFMPEG.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm).

## License

Recorder is released under the [MIT License](LICENSE), allowing you to freely use, modify, and distribute the application.

<br/>

---

<br/>

Time to unleash your creativity and capture those moments with Recorder! 🎬🌟 Lights, camera, action!

# Streaming Tools - Raspberry Pi

## Printer

## what you need

- [thermal printer](http://www.hobbytronics.co.uk/thermal-printer)
- 57mm thermal paper
- Arduino Uno (Works with other devices that can use serial port too use the corresponding RX and TX)
- [Arduino IDE](https://www.arduino.cc/en/Main/Software)
- some jumper wires
- 9V power supply (splice wires and shove into thermal printer)
- [Last.fm API key](http://www.last.fm/api)

## installation

1.  upload the `StandardFirmata` example code to your Arduino Uno (`File/Examples/Firmata/StandardFirmata` -> `Upload`)
2.  [set-up your thermal printer](https://learn.adafruit.com/mini-thermal-receipt-printer)

![Visual set-up](setup.png)

> you will probably need to tweak the settings for your printer, [see the thermalprinter module comments](https://github.com/xseignard/thermalPrinter/blob/master/src/printer.js#L12) 3. add environment variables. (Copy `.env-sample` to `.env`)

```
 PRINTER_USB= # this is where the arduino is mounted at, see your Arduino IDE (Tools/Port)
 PRINTER_BAUDRATE= # hold the power button and plug the power in, the baudrate is printed on the test page
```

4.  install non-node dependencies: [GraphicsMagick](http://www.graphicsmagick.org/)

```
sudo apt-get update
sudo apt-get install graphicsmagick
```

5.  install node dependencies

```
npm install
```

## run

```
node main.js
```

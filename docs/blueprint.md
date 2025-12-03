# **App Name**: PatternSight

## Core Features:

- Data Ingestion: Fetch stock data (OHLCV) from yfinance based on user-specified ticker and timeframe.
- Technical Indicator Calculation: Calculate RSI, MACD, MA20, MA50, and MA200 using pandas_ta.
- Support & Resistance Detection: Detect support and resistance levels using K-Means clustering (sklearn) and noise-free level detection with DBSCAN (sklearn).
- LSTM Trend Prediction: Train an LSTM model (Keras/TensorFlow) to predict the short-term price trend (up/down).
- CNN Pattern Classification: Train a 1D CNN model (Keras/TensorFlow) to classify chart patterns (double top, triangle, breakout).
- Prediction Pipeline: Implement a pipeline where the LSTM model predicts the trend, and the 1D CNN identifies chart patterns, displaying the information alongside candlestick charts, technical indicators and support/resistance levels.
- Candlestick Chart Visualization: Display a candlestick chart generated with Matplotlib or Plotly based on user inputs. Display tech indicators and support/resistance levels on chart

## Style Guidelines:

- Primary color: Deep indigo (#4B0082) for a sense of stability and insight.
- Background color: Light gray (#F0F0F0) to ensure clarity and readability of charts and data.
- Accent color: Vivid magenta (#FF00FF) to highlight predictions and key levels.
- Body and headline font: 'Inter' sans-serif, for a modern, clean and highly readable style. Used for headlines and body text.
- Use simple, minimalist icons to represent different technical indicators and chart patterns.
- Maintain a clean and structured layout, prioritizing data clarity and ease of navigation.
- Implement subtle animations for loading data and updating charts to enhance user engagement without distraction.
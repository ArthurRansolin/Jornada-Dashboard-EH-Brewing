import threading
import time


class N1050State:
    def __init__(self):
        self.registers = {
            0: 18,
            1: 22,
            2: 0,
            12: 0,
            13: 0,
            14: 0,
            29: 18,
            84: 1,
            86: 0,
            88: 0,
            89: 1,
            90: 0,
        }
        self.ambient = 22.0
        self.lock = threading.Lock()
        self.running = False
        self.thread = None

    def start(self):
        if self.running:
            return
        self.running = True
        self.thread = threading.Thread(target=self._loop, daemon=True)
        self.thread.start()

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join(timeout=2)

    def _loop(self):
        while self.running:
            with self.lock:
                pv = float(self.registers[1])
                sp = float(self.registers[29])
                run = self.registers[84]
                mode = self.registers[86]
                if run == 1 and mode == 0:
                    error = sp - pv
                    step = max(min(error * 0.15, 1.0), -1.0)
                    pv += step
                    self.registers[2] = int(min(abs(error) * 10, 100))
                elif run == 0:
                    pv += (self.ambient - pv) * 0.05
                    self.registers[2] = 0
                self.registers[1] = int(round(pv))
                self.registers[0] = self.registers[29]
            time.sleep(1)

package client

import (
	"crypto/tls"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type HttpClient struct {
	client  *http.Client
	headers http.Header
}

func NewHttpClient(timeoutSecond ...time.Duration) *HttpClient {
	transport := &http.Transport{
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: true, // 忽略证书校验
			ClientAuth:         tls.NoClientCert,
		},
	}

	// 使用自定义的Transport创建HttpClient实例
	timeout := 39 * time.Second
	if len(timeoutSecond) > 0 {
		timeout = timeoutSecond[0]
	}
	client := &http.Client{
		Transport: transport,
		Timeout:   timeout, // 设置请求超时时间
	}
	return &HttpClient{client: client, headers: make(map[string][]string)}
}

func (c *HttpClient) SetHeader(name string, value string) {
	c.headers.Add(name, value)
}

func (c *HttpClient) Get(url string, body io.Reader) ([]byte, error) {
	return c.doRequest(http.MethodGet, url, body)
}

func (c *HttpClient) Post(url string, body io.Reader) ([]byte, error) {
	return c.doRequest(http.MethodPost, url, body)
}

func (c *HttpClient) doRequest(method, url string, body io.Reader) ([]byte, error) {
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil, err
	}

	req.Header = c.headers

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("request url : %s err,statusCode:%d,status:%s", url, resp.StatusCode, resp.Status)
	}

	defer resp.Body.Close()

	var dst strings.Builder

	_, err = io.Copy(&dst, resp.Body)
	if err != nil {
		return nil, err
	}

	return []byte(dst.String()), nil
}

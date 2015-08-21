Vagrant.configure( "2" ) do | config |
    config.vm.box = "ubuntu/trusty64"

    config.vm.hostname = "chech-lajan.lan"

    config.vm.provision :shell, :path => "_dev/deploy.sh"

    # change the IP by one you own
    config.vm.network :private_network, ip: "192.168.111.204"
    config.vm.network :forwarded_port, guest: 27017, host: 27017

    config.vm.provider "virtualbox" do | vbox |
        vbox.name = "chech-lajan-sept7"
    end
end